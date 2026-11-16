"""Plain Python results shared by the detector and its callers."""

from dataclasses import dataclass


@dataclass
class Detection:
    """One prediction; bounding_box contains pixel coordinates (x1, y1, x2, y2)."""

    label: str
    confidence: float
    bounding_box: tuple[float, float, float, float]
    class_id: int
