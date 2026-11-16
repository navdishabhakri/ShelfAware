"""Small offline checks: no training, checkpoints, GUI, or real camera needed."""

from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import sys
import unittest
from unittest.mock import MagicMock, patch

import numpy as np

from training.evaluate import evaluate_model
from training.train import train_model
from vision.camera import show_video
from vision.detector import SnackDetector
from vision.models import Detection
from vision.visualization import draw_detections


def fake_prediction() -> SimpleNamespace:
    """Provide the three tensor attributes used by the YOLO result adapter."""
    boxes = MagicMock()
    boxes.xyxy.cpu.return_value.tolist.return_value = [
        [2, 20, 30, 45], [35, 22, 60, 50], [3, 4, 12, 15]
    ]
    boxes.conf.cpu.return_value.tolist.return_value = [0.9, 0.75, 0.2]
    boxes.cls.cpu.return_value.tolist.return_value = [1.0, 0.0, 1.0]
    return SimpleNamespace(boxes=boxes, names={0: "CandyBar", 1: "ChipsLimon"})


class VisionTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.weights = Path(self.temporary.name) / "best.pt"
        self.weights.touch()
        self.model = MagicMock(task="detect")
        self.model.predict.return_value = [fake_prediction()]
        self.load_model = MagicMock(return_value=self.model)
        self.check_dataset = MagicMock(return_value={"val": self.temporary.name})
        fake_utils = SimpleNamespace(check_det_dataset=self.check_dataset)
        fake_data = SimpleNamespace(utils=fake_utils)
        fake_ultralytics = SimpleNamespace(YOLO=self.load_model, data=fake_data)
        # Replace the model library itself: unit tests need no PyTorch initialization.
        modules = patch.dict(sys.modules, {
            "ultralytics": fake_ultralytics,
            "ultralytics.data": fake_data,
            "ultralytics.data.utils": fake_utils,
        })
        modules.start()
        self.addCleanup(modules.stop)
        self.detector = SnackDetector(self.weights, confidence_threshold=0.5)
        self.image = np.zeros((64, 64, 3), dtype=np.uint8)

    def test_multiple_results_are_plain_objects_and_filtered(self) -> None:
        detections = self.detector.detect(self.image)
        self.assertEqual(len(detections), 2)
        self.assertEqual(detections[0], Detection("ChipsLimon", 0.9, (2, 20, 30, 45), 1))
        self.assertEqual(detections[1].label, "CandyBar")
        self.assertIsInstance(detections[0].confidence, float)
        self.model.predict.assert_called_once_with(
            source=self.image, conf=0.5, verbose=False, save=False
        )

    def test_no_boxes_returns_empty_list(self) -> None:
        self.model.predict.return_value = [SimpleNamespace(boxes=None)]
        self.assertEqual(self.detector.detect(self.image), [])
        self.model.predict.return_value = []
        self.assertEqual(self.detector.detect(self.image), [])

    def test_all_predictions_below_threshold_returns_empty_list(self) -> None:
        detector = SnackDetector(self.weights, confidence_threshold=0.95)
        self.assertEqual(detector.detect(self.image), [])

    def test_real_image_path_is_read(self) -> None:
        import cv2

        image_path = Path(self.temporary.name) / "photo.png"
        self.assertTrue(cv2.imwrite(str(image_path), self.image))
        self.assertEqual(len(self.detector.detect(str(image_path))), 2)

    def test_missing_weights_fail_before_model_loading(self) -> None:
        self.load_model.reset_mock()
        with self.assertRaisesRegex(FileNotFoundError, "Model weights not found"):
            SnackDetector(self.weights.with_name("missing.pt"))
        self.load_model.assert_not_called()

    def test_bad_inputs_have_clear_errors(self) -> None:
        for threshold in (-0.1, 1.1, float("nan")):
            with self.subTest(threshold=threshold), self.assertRaises(ValueError):
                SnackDetector(self.weights, threshold)
        with self.assertRaises(FileNotFoundError):
            self.detector.detect(self.weights.with_name("missing.jpg"))
        with self.assertRaisesRegex(ValueError, "Could not read image"):
            self.detector.detect(self.weights)  # Empty file, not an image.
        for invalid_image in (self.image[:, :, 0], np.array([]), self.image.astype(float)):
            with self.subTest(shape=invalid_image.shape), self.assertRaises(ValueError):
                self.detector.detect(invalid_image)
        with self.assertRaises(TypeError):
            self.detector.detect(None)

    def test_wrong_model_task_is_rejected(self) -> None:
        self.model.task = "classify"
        with self.assertRaisesRegex(ValueError, "object detection checkpoint"):
            SnackDetector(self.weights)

    def test_drawing_preserves_original_image(self) -> None:
        annotated = draw_detections(self.image, self.detector.detect(self.image))
        self.assertFalse(np.any(self.image))
        self.assertTrue(np.any(annotated))

    @patch("vision.camera.cv2.destroyAllWindows")
    @patch("vision.camera.cv2.VideoCapture")
    def test_camera_is_released_after_inference_error(self, capture_factory, close_windows) -> None:
        capture = capture_factory.return_value
        capture.isOpened.return_value = True
        capture.read.return_value = (True, self.image)
        self.detector.detect = MagicMock(side_effect=RuntimeError("inference failed"))
        with self.assertRaisesRegex(RuntimeError, "inference failed"):
            show_video(self.detector)
        capture.release.assert_called_once()
        close_windows.assert_called_once()

    @patch("vision.camera.cv2.destroyAllWindows")
    @patch("vision.camera.cv2.VideoCapture")
    def test_unavailable_camera_is_released(self, capture_factory, close_windows) -> None:
        capture = capture_factory.return_value
        capture.isOpened.return_value = False
        with self.assertRaisesRegex(RuntimeError, "Could not open webcam"):
            show_video(self.detector)
        capture.release.assert_called_once()
        close_windows.assert_called_once()

    @patch("vision.camera.cv2.destroyAllWindows")
    @patch("vision.camera.cv2.getWindowProperty", return_value=1)
    @patch("vision.camera.cv2.waitKey", return_value=ord("q"))
    @patch("vision.camera.cv2.imshow")
    @patch("vision.camera.cv2.VideoCapture")
    def test_q_stops_webcam_and_releases_it(
        self, capture_factory, show_frame, wait_key, window_property, close_windows
    ) -> None:
        capture = capture_factory.return_value
        capture.isOpened.return_value = True
        capture.read.return_value = (True, self.image)
        show_video(self.detector, 1)
        capture_factory.assert_called_once_with(1)
        capture.read.assert_called_once()
        capture.release.assert_called_once()
        close_windows.assert_called_once()

    def test_evaluation_uses_builtin_metrics(self) -> None:
        data = Path(self.temporary.name) / "data.yaml"
        data.touch()
        self.model.val.return_value = SimpleNamespace(
            box=SimpleNamespace(mp=0.8, mr=0.7, map50=0.75, map=0.6)
        )
        metrics = evaluate_model(self.weights, data)
        self.assertEqual(metrics, {"precision": 0.8, "recall": 0.7, "mAP50": 0.75, "mAP50-95": 0.6})
        self.check_dataset.assert_called_once_with(str(data.resolve()), autodownload=False)

    def test_training_forwards_options_and_returns_actual_run_path(self) -> None:
        data = Path(self.temporary.name) / "data.yaml"
        data.touch()
        run_directory = Path(self.temporary.name) / "snacks2"
        self.model.trainer.save_dir = run_directory
        best_weights = train_model(
            data, str(self.weights), epochs=2, image_size=320, batch_size=1,
            device="cpu", name="snacks",
        )
        self.assertEqual(best_weights, run_directory / "weights/best.pt")
        self.check_dataset.assert_called_once_with(str(data.resolve()), autodownload=False)
        options = self.model.train.call_args.kwargs
        self.assertEqual(options["data"], str(data.resolve()))
        self.assertEqual((options["epochs"], options["imgsz"], options["batch"]), (2, 320, 1))
        self.assertEqual(options["workers"], 0)
        self.assertFalse(options["exist_ok"])
        self.assertNotIn("names", options)  # Labels belong to the dataset YAML.

    def test_missing_dataset_stops_before_loading_training_model(self) -> None:
        data = Path(self.temporary.name) / "data.yaml"
        data.touch()
        self.load_model.reset_mock()
        self.check_dataset.side_effect = FileNotFoundError("Missing data")
        with self.assertRaisesRegex(FileNotFoundError, "Missing data"):
            train_model(data)
        self.load_model.assert_not_called()

    def test_missing_test_images_stop_before_validation_can_download_data(self) -> None:
        data = Path(self.temporary.name) / "data.yaml"
        data.touch()
        self.check_dataset.return_value["test"] = str(Path(self.temporary.name) / "missing")
        self.load_model.reset_mock()
        with self.assertRaisesRegex(FileNotFoundError, "Local test images not found"):
            evaluate_model(self.weights, data, split="test")
        self.load_model.assert_not_called()
        self.model.val.assert_not_called()

    def test_cuda_training_forwards_autobatch_and_workers(self) -> None:
        data = Path(self.temporary.name) / "data.yaml"
        data.touch()
        self.model.trainer.save_dir = Path(self.temporary.name) / "lab4090"
        cuda = SimpleNamespace(is_available=lambda: True, device_count=lambda: 1)
        with patch.dict(sys.modules, {"torch": SimpleNamespace(cuda=cuda)}):
            train_model(data, device="0", batch_size=-1, workers=4)
        options = self.model.train.call_args.kwargs
        self.assertEqual((options["device"], options["batch"], options["workers"]), ("0", -1, 4))

    def test_unavailable_cuda_stops_before_training(self) -> None:
        data = Path(self.temporary.name) / "data.yaml"
        data.touch()
        cuda = SimpleNamespace(is_available=lambda: False)
        self.load_model.reset_mock()
        with patch.dict(sys.modules, {"torch": SimpleNamespace(cuda=cuda)}):
            with self.assertRaisesRegex(RuntimeError, "CUDA is unavailable"):
                train_model(data, device="0")
        self.load_model.assert_not_called()
        self.model.train.assert_not_called()

    def test_cpu_autobatch_and_negative_workers_are_rejected(self) -> None:
        data = Path(self.temporary.name) / "data.yaml"
        data.touch()
        with self.assertRaisesRegex(ValueError, "AutoBatch requires a CUDA GPU"):
            train_model(data, batch_size=-1)
        with self.assertRaisesRegex(ValueError, "workers must be zero or greater"):
            train_model(data, workers=-1)


if __name__ == "__main__":
    unittest.main()
