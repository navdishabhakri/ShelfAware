"""Optional OpenCV drawing, independent of the detection model."""

from collections.abc import Iterable

import cv2
import numpy as np
from numpy.typing import NDArray

from .models import Detection


def draw_detections(
    image: NDArray[np.uint8], detections: Iterable[Detection]
) -> NDArray[np.uint8]:
    """Return an annotated copy, leaving the caller's original image untouched."""
    annotated = image.copy()
    for detection in detections:
        x1, y1, x2, y2 = (round(value) for value in detection.bounding_box)
        label = f"{detection.label} {detection.confidence:.0%}"
        cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 200, 0), 2)
        cv2.putText(
            annotated, label, (max(0, x1), max(18, y1 - 8)),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 200, 0), 2, cv2.LINE_AA,
        )
    return annotated
