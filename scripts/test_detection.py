"""Command-line manual tests for images, video files, and a webcam."""

import argparse
from pathlib import Path
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[1]
# Direct script execution puts scripts/, rather than the project root, on sys.path.
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


def main() -> None:
    """Parse a source, run inference, and optionally save an annotated image."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", choices=("image", "video", "webcam"), required=True)
    parser.add_argument("--input", type=Path, help="Local image or video file")
    parser.add_argument("--weights", type=Path, default=PROJECT_ROOT / "weights/best.pt")
    parser.add_argument("--confidence", type=float, default=0.5)
    parser.add_argument("--device-index", type=int, default=0, help="Webcam index (default: 0)")
    parser.add_argument(
        "--save", nargs="?", type=Path, const=PROJECT_ROOT / "outputs/detection.jpg",
        help="Save an image; optional path (default: outputs/detection.jpg)",
    )
    parser.add_argument("--no-display", action="store_true", help="Image mode: skip the window")
    args = parser.parse_args()
    if args.source != "webcam" and args.input is None:
        parser.error("--input is required for image and video sources.")
    if args.source != "image" and (args.save or args.no_display):
        parser.error("--save and --no-display are supported only for images.")
    if args.source == "webcam" and args.input is not None:
        parser.error("Use --device-index, rather than --input, for a webcam.")

    try:
        import cv2

        from vision.camera import show_video
        from vision.detector import SnackDetector
        from vision.visualization import draw_detections

        detector = SnackDetector(args.weights, args.confidence)
        if args.source != "image":
            source = args.device_index if args.source == "webcam" else args.input
            show_video(detector, source)
            return

        image_path = args.input.expanduser().resolve()
        if not image_path.is_file():
            raise FileNotFoundError(f"Image not found: {image_path}")
        image = cv2.imread(str(image_path))
        if image is None:
            raise ValueError(f"Could not read image: {image_path}")
        detections = detector.detect(image)
        for detection in detections:
            print(f"{detection.label}: {detection.confidence:.1%} {detection.bounding_box}")
        if not detections:
            print("No products detected at this confidence threshold.")
        annotated = draw_detections(image, detections)
        if args.save:
            output = args.save.expanduser().resolve()
            output.parent.mkdir(parents=True, exist_ok=True)
            if not cv2.imwrite(str(output), annotated):
                raise OSError(f"Could not save annotated image: {output}")
            print(f"Saved image: {output}")
        if not args.no_display:
            try:
                cv2.imshow("Snack detection - press any key to close", annotated)
                cv2.waitKey(0)
            finally:
                cv2.destroyAllWindows()
    except ImportError as error:
        parser.exit(1, f"Missing dependency: {error}. Run python -m pip install -r requirements.txt\n")
    except Exception as error:
        # The reusable detector raises errors normally; the CLI shows a concise message.
        parser.exit(1, f"Detection failed: {error}\n")
    except KeyboardInterrupt:
        parser.exit(130, "Stopped.\n")


if __name__ == "__main__":
    main()
