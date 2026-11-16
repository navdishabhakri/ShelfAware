"""Load a local YOLO checkpoint and convert predictions into simple results."""

from pathlib import Path

import cv2
import numpy as np
from numpy.typing import NDArray

from .models import Detection


class SnackDetector:
    """Detect the classes learned by a trained object detection checkpoint."""

    def __init__(
        self, weights_path: str | Path, confidence_threshold: float = 0.5
    ) -> None:
        if not 0.0 <= confidence_threshold <= 1.0:
            raise ValueError("Confidence threshold must be between 0 and 1.")

        weights = Path(weights_path).expanduser().resolve()
        if not weights.is_file():
            raise FileNotFoundError(
                f"Model weights not found: {weights}. Train a model first, then "
                "pass its best.pt path. Inference never downloads weights."
            )

        # Delay this heavy import until a detector is actually constructed.
        from ultralytics import YOLO

        self._model = YOLO(str(weights))
        if self._model.task != "detect":
            raise ValueError("Use an object detection checkpoint, not a classifier or segmenter.")
        self.confidence_threshold = confidence_threshold

    def detect(self, image: str | Path | NDArray[np.uint8]) -> list[Detection]:
        """Detect products in an image path or a uint8 OpenCV BGR image."""
        if isinstance(image, (str, Path)):
            image_path = Path(image).expanduser().resolve()
            if not image_path.is_file():
                raise FileNotFoundError(f"Image not found: {image_path}")
            image = cv2.imread(str(image_path))
            if image is None:
                raise ValueError(f"Could not read image: {image_path}")

        if not isinstance(image, np.ndarray):
            raise TypeError("Image must be a file path or an OpenCV NumPy image.")
        if image.size == 0 or image.ndim != 3 or image.shape[2] != 3:
            raise ValueError("Image must be a nonempty BGR image with three channels.")
        if image.dtype != np.uint8:
            raise ValueError("Image must use uint8 pixels in the range 0 to 255.")

        predictions = self._model.predict(
            source=image, conf=self.confidence_threshold, verbose=False, save=False
        )
        detections: list[Detection] = []
        for prediction in predictions:
            if prediction.boxes is None:
                continue

            boxes = prediction.boxes
            # Move tensors to the CPU so callers never receive YOLO or GPU objects.
            coordinates = boxes.xyxy.cpu().tolist()
            confidences = boxes.conf.cpu().tolist()
            class_ids = boxes.cls.cpu().tolist()
            for box, confidence, class_id in zip(coordinates, confidences, class_ids):
                if confidence < self.confidence_threshold:
                    continue
                detections.append(
                    Detection(
                        label=prediction.names[int(class_id)],
                        confidence=float(confidence),
                        bounding_box=tuple(float(value) for value in box),
                        class_id=int(class_id),
                    )
                )
        return detections
