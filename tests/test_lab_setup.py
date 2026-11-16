"""Offline checks for preparing another computer; no installs, GPU, or downloads."""

import contextlib
import io
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import MagicMock, patch
import zipfile

import requests
import yaml

from scripts.prepare_dataset import configure_dataset, download_dataset, extract_dataset
from scripts.setup_training import GPU_CHECK, TORCH_PACKAGES, setup_environment


class LabSetupTests(unittest.TestCase):
    def setUp(self) -> None:
        temporary = TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)

    def create_dataset(self, validation: str = "valid") -> Path:
        """Make a tiny export with an old machine's paths and real YAML parsing."""
        directory = self.root / "grocery"
        for folder in ("train", validation, "test"):
            (directory / folder / "images").mkdir(parents=True)
            (directory / folder / "labels").mkdir()
            (directory / folder / "images/example.jpg").touch()
            (directory / folder / "labels/example.txt").write_text("1 0.5 0.5 0.4 0.4\n")
        data = {
            "path": "D:/some/other/computer/grocery",
            "train": "../train/images", "val": "../valid/images", "test": "../test/images",
            "nc": 2, "names": ["ExampleCandy", "ExampleChips"],
            "roboflow": {"version": 9},
        }
        (directory / "data.yaml").write_text(yaml.safe_dump(data), encoding="utf-8")
        return directory

    def test_copied_dataset_gets_local_paths_without_changing_labels(self) -> None:
        directory = self.create_dataset()
        label = directory / "train/labels/example.txt"
        original_label = label.read_bytes()
        original_yaml = (directory / "data.yaml").read_bytes()
        with contextlib.redirect_stdout(io.StringIO()):
            configured = configure_dataset(directory)
            configure_dataset(directory)  # Preparing twice must keep the first backup.
        data = yaml.safe_load(configured.read_text())
        self.assertEqual(data["path"], directory.resolve().as_posix())
        self.assertEqual(data["val"], "valid/images")
        self.assertEqual(data["names"], ["ExampleCandy", "ExampleChips"])
        self.assertEqual(data["roboflow"], {"version": 9})
        self.assertEqual(label.read_bytes(), original_label)
        self.assertEqual((directory / "data.original.yaml").read_bytes(), original_yaml)

    def test_val_folder_and_dictionary_class_names_are_supported(self) -> None:
        directory = self.create_dataset(validation="val")
        path = directory / "data.yaml"
        data = yaml.safe_load(path.read_text())
        data["names"] = {0: "ExampleCandy", 1: "ExampleChips"}
        path.write_text(yaml.safe_dump(data))
        with contextlib.redirect_stdout(io.StringIO()):
            configure_dataset(directory)
        configured = yaml.safe_load(path.read_text())
        self.assertEqual(configured["val"], "val/images")
        self.assertEqual(configured["names"], data["names"])

    def test_missing_split_stops_before_yaml_is_rewritten(self) -> None:
        directory = self.create_dataset()
        # Only remove the known empty directory created in this test.
        (directory / "test/labels/example.txt").unlink()
        (directory / "test/labels").rmdir()
        original = (directory / "data.yaml").read_bytes()
        with self.assertRaisesRegex(FileNotFoundError, "images/ and labels/"):
            configure_dataset(directory)
        self.assertEqual((directory / "data.yaml").read_bytes(), original)

    def test_archive_is_extracted_without_replacing_an_existing_dataset(self) -> None:
        archive_path = self.root / "data.zip"
        with zipfile.ZipFile(archive_path, "w") as archive:
            archive.writestr("data.yaml", "names: [Example]\n")
        destination = self.root / "dataset"
        extract_dataset(archive_path, destination)
        self.assertTrue((destination / "data.yaml").is_file())
        with self.assertRaisesRegex(ValueError, "not empty"):
            extract_dataset(archive_path, destination)

    def test_archive_traversal_is_rejected_before_extraction(self) -> None:
        archive_path = self.root / "unsafe.zip"
        with zipfile.ZipFile(archive_path, "w") as archive:
            archive.writestr("../escape.txt", "unexpected")
        with self.assertRaisesRegex(ValueError, "outside"):
            extract_dataset(archive_path, self.root / "dataset")
        self.assertFalse((self.root / "escape.txt").exists())

    @patch("scripts.prepare_dataset.time.sleep")
    @patch("scripts.prepare_dataset.requests.get")
    def test_download_polls_export_and_keeps_api_key_off_archive_request(self, get, sleep) -> None:
        preparing = MagicMock(status_code=202)
        preparing.json.return_value = {"progress": 0.5}
        preparing.__enter__.return_value = preparing
        ready = MagicMock(status_code=200)
        ready.json.return_value = {"export": {"link": "https://example.com/test-archive"}}
        ready.__enter__.return_value = ready
        download = MagicMock(status_code=200)
        download.__enter__.return_value = download
        download.iter_content.return_value = [b"example archive bytes"]
        get.side_effect = [preparing, ready, download]
        target = self.root / "cache/dataset.zip"
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            download_dataset(9, target, "fake-test-key")
        self.assertEqual(target.read_bytes(), b"example archive bytes")
        self.assertEqual(get.call_args_list[0].kwargs["headers"], {"Authorization": "Bearer fake-test-key"})
        self.assertNotIn("headers", get.call_args_list[2].kwargs)
        self.assertNotIn("fake-test-key", output.getvalue())
        self.assertNotIn("https://example.com", output.getvalue())
        sleep.assert_called_once_with(10)

    @patch("scripts.prepare_dataset.requests.get")
    def test_failed_export_reports_only_the_http_status(self, get) -> None:
        response = MagicMock(status_code=401)
        response.__enter__.return_value = response
        get.return_value = response
        with self.assertRaisesRegex(RuntimeError, "HTTP 401"):
            download_dataset(9, self.root / "data.zip", "fake-test-key")
        self.assertFalse((self.root / "data.zip").exists())

    @patch("scripts.prepare_dataset.getpass", return_value="fake-test-key")
    @patch("scripts.prepare_dataset.requests.get", side_effect=requests.ConnectionError("signed-secret-url"))
    def test_cli_redacts_network_exception_details(self, get, key_prompt) -> None:
        from scripts.prepare_dataset import main

        error_output = io.StringIO()
        with patch("scripts.prepare_dataset.PROJECT_ROOT", self.root), \
             patch("sys.argv", ["prepare_dataset.py", "--download"]), \
             patch.dict("os.environ", {"ROBOFLOW_API_KEY": ""}), \
             contextlib.redirect_stderr(error_output), self.assertRaises(SystemExit) as stopped:
            main()
        self.assertEqual(stopped.exception.code, 1)
        self.assertIn("Download request failed", error_output.getvalue())
        self.assertNotIn("signed-secret-url", error_output.getvalue())
        self.assertNotIn("fake-test-key", error_output.getvalue())

    @patch("scripts.setup_training.venv.create")
    @patch("scripts.setup_training.subprocess.run")
    def test_setup_installs_cuda_pytorch_before_project_dependencies(self, run, create) -> None:
        with patch("scripts.setup_training.PROJECT_ROOT", self.root):
            python = setup_environment()
        create.assert_called_once_with(self.root / ".venv", with_pip=True)
        commands = [call.args[0] for call in run.call_args_list]
        self.assertIn("--force-reinstall", commands[1])
        for package in TORCH_PACKAGES:
            self.assertIn(package, commands[1])
        self.assertEqual(commands[1][-1], "https://download.pytorch.org/whl/cu126")
        self.assertEqual(commands[2][-1], str(self.root / "requirements.txt"))
        self.assertEqual(commands[3], [str(python), "-c", GPU_CHECK])
        compile(GPU_CHECK, "gpu_check", "exec")

    @patch("scripts.setup_training.subprocess.run")
    def test_check_only_does_not_install_packages(self, run) -> None:
        import os

        python = self.root / ".venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
        python.parent.mkdir(parents=True)
        python.touch()
        with patch("scripts.setup_training.PROJECT_ROOT", self.root):
            self.assertEqual(setup_environment(check_only=True), python)
        run.assert_called_once_with([str(python), "-c", GPU_CHECK], check=True)


if __name__ == "__main__":
    unittest.main()
