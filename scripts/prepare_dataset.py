"""Prepare an existing grocery export, extract a local ZIP, or explicitly download it."""

import argparse
from getpass import getpass
import os
from pathlib import Path
import time
import zipfile

import requests
import yaml


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def download_dataset(version: int, archive_path: Path, api_key: str) -> None:
    """Request a Roboflow YOLO export and stream its ZIP without logging credentials."""
    if version < 1:
        raise ValueError("Dataset version must be positive.")
    if not api_key or any(character.isspace() for character in api_key):
        raise ValueError("Provide a private Roboflow API key, without spaces.")
    endpoint = (
        "https://api.roboflow.com/lamar-university-venef/"
        f"grocery-rfn8l/{version}/yolov8"
    )
    deadline = time.monotonic() + 900
    download_link = None
    while time.monotonic() < deadline:
        with requests.get(
            endpoint, headers={"Authorization": f"Bearer {api_key}"}, timeout=(15, 30)
        ) as response:
            if response.status_code not in (200, 202):
                raise RuntimeError(f"Roboflow export returned HTTP {response.status_code}.")
            download_link = (response.json().get("export") or {}).get("link")
        if download_link:
            break
        print("Roboflow is preparing the export; checking again in 10 seconds.", flush=True)
        time.sleep(10)
    if not download_link:
        raise TimeoutError("Roboflow did not finish exporting within 15 minutes. Retry later.")
    if not isinstance(download_link, str) or not download_link.startswith("https://"):
        raise RuntimeError("Roboflow did not return an HTTPS download link.")

    archive_path.parent.mkdir(parents=True, exist_ok=True)
    print("Export ready. Downloading archive.", flush=True)
    # This separate request keeps the API authorization away from the archive host.
    with requests.get(download_link, stream=True, timeout=(15, 60)) as download:
        if download.status_code != 200:
            raise RuntimeError(f"Archive download returned HTTP {download.status_code}.")
        downloaded = 0
        next_progress = 64 * 1024 * 1024
        with archive_path.open("wb") as archive_file:
            for chunk in download.iter_content(chunk_size=1024 * 1024):
                archive_file.write(chunk)
                downloaded += len(chunk)
                if downloaded >= next_progress:
                    print(f"Downloaded {downloaded / 1024**2:.0f} MiB.", flush=True)
                    next_progress = downloaded + 64 * 1024 * 1024


def extract_dataset(archive_path: Path, destination: Path) -> None:
    """Extract a ZIP into an empty folder, checking every archive path first."""
    destination = destination.resolve()
    if destination.exists() and any(destination.iterdir()):
        raise ValueError(f"Destination is not empty: {destination}. Omit --archive to prepare it.")
    with zipfile.ZipFile(archive_path) as archive:
        for entry in archive.infolist():
            target = (destination / entry.filename).resolve()
            if not target.is_relative_to(destination):
                raise ValueError("Archive contains a path outside the dataset directory.")
        destination.mkdir(parents=True, exist_ok=True)
        archive.extractall(destination)


def configure_dataset(directory: Path) -> Path:
    """Set paths for this machine while preserving the exported class names and IDs."""
    directory = directory.expanduser().resolve()
    data_path = directory / "data.yaml"
    if not data_path.is_file():
        raise FileNotFoundError(f"Expected data.yaml directly inside {directory}.")
    data = yaml.safe_load(data_path.read_text(encoding="utf-8-sig"))
    if not isinstance(data, dict):
        raise ValueError("Dataset YAML must contain a mapping of settings.")
    if not isinstance(data.get("names"), (list, dict)) or not data["names"]:
        raise ValueError("Dataset YAML must contain its original class names.")
    if data.get("nc", len(data["names"])) != len(data["names"]):
        raise ValueError("Dataset nc and class name count disagree.")
    validation = "valid" if (directory / "valid/images").is_dir() else "val"
    folders = {"train": "train", "val": validation}
    if data.get("test") or (directory / "test/images").is_dir():
        folders["test"] = "test"
    counts = {}
    for split, folder in folders.items():
        images = directory / folder / "images"
        labels = directory / folder / "labels"
        if not images.is_dir() or not labels.is_dir():
            raise FileNotFoundError(f"Expected images/ and labels/ folders inside {directory / folder}.")
        count = sum(path.is_file() for path in images.iterdir())
        if count == 0:
            raise ValueError(f"No images found in {images}.")
        counts[split] = count
        data[split] = f"{folder}/images"
    # Keep the original configuration beside the data for reference.
    backup = directory / "data.original.yaml"
    if not backup.exists():
        backup.write_bytes(data_path.read_bytes())
    data["path"] = directory.as_posix()
    data_path.write_text(yaml.safe_dump(data, sort_keys=False), encoding="utf-8")
    print(f"Dataset ready: {data_path}")
    print(f"Classes: {len(data['names'])}; images by split: {counts}")
    return data_path


def main() -> None:
    """Prepare only by default; downloading requires the explicit --download flag."""
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--download", action="store_true", help="Download from Roboflow (prompts for key)")
    source.add_argument("--archive", type=Path, help="Extract an existing YOLO ZIP")
    parser.add_argument("--directory", type=Path, default=PROJECT_ROOT / "datasets/grocery")
    parser.add_argument("--version", type=int, default=9, help="Roboflow dataset version (default: 9)")
    args = parser.parse_args()
    try:
        directory = args.directory.expanduser().resolve()
        archive = args.archive
        if args.download:
            if directory.exists() and any(directory.iterdir()):
                raise ValueError(f"Dataset directory is not empty: {directory}. Omit --download to prepare it.")
            api_key = os.environ.get("ROBOFLOW_API_KEY") or getpass("Private Roboflow API key: ")
            archive = PROJECT_ROOT / "datasets" / f"grocery-v{args.version}.zip"
            download_dataset(args.version, archive, api_key)
        if archive is not None:
            extract_dataset(archive.expanduser().resolve(), directory)
        configure_dataset(directory)
    except requests.RequestException:
        # Network exception messages can contain signed URLs; never print them.
        parser.exit(1, "Download request failed. Check connectivity and retry; credentials were not logged.\n")
    except (OSError, ValueError, RuntimeError, zipfile.BadZipFile, yaml.YAMLError) as error:
        parser.exit(1, f"Dataset preparation failed: {error}\n")
    except (KeyboardInterrupt, EOFError):
        parser.exit(130, "Dataset preparation stopped.\n")


if __name__ == "__main__":
    main()
