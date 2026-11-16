"""Manual video and webcam testing with reliable camera cleanup."""

from pathlib import Path

import cv2

from .detector import SnackDetector
from .visualization import draw_detections


def show_video(detector: SnackDetector, source: int | str | Path = 0) -> None:
    """Display a local video or webcam (integer index) until Q or window close."""
    is_webcam = isinstance(source, int)
    if is_webcam:
        if source < 0:
            raise ValueError("Webcam device index must be zero or greater.")
    else:
        video_path = Path(source).expanduser().resolve()
        if not video_path.is_file():
            raise FileNotFoundError(f"Video not found: {video_path}")
        source = str(video_path)

    capture = cv2.VideoCapture(source)
    window_name = "Snack detection - press Q to quit"
    frames_read = 0
    try:
        if not capture.isOpened():
            raise RuntimeError(
                f"Could not open {'webcam' if is_webcam else 'video'}: {source}. "
                "Check the device index, camera permissions, or video format."
            )
        while True:
            success, frame = capture.read()
            if not success:
                if is_webcam or frames_read == 0:
                    raise RuntimeError(f"Could not read a frame from: {source}")
                break  # A file normally stops producing frames at the end.
            frames_read += 1
            annotated = draw_detections(frame, detector.detect(frame))
            cv2.imshow(window_name, annotated)
            key = cv2.waitKey(1) & 0xFF
            if key in (ord("q"), ord("Q")):
                break
            if cv2.getWindowProperty(window_name, cv2.WND_PROP_VISIBLE) < 1:
                break
    finally:
        capture.release()
        cv2.destroyAllWindows()
