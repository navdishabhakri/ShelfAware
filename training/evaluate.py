"""Evaluate a local trained checkpoint using Ultralytics detection metrics."""

import argparse
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def evaluate_model(
    weights: str | Path,
    data: str | Path,
    split: str = "val",
    image_size: int = 640,
    batch_size: int = 8,
    device: str = "cpu",
) -> dict[str, float]:
    """Return built-in mean precision, recall, mAP50, and mAP50-95 scores."""
    weights_path = Path(weights).expanduser().resolve()
    data_path = Path(data).expanduser().resolve()
    if not weights_path.is_file():
        raise FileNotFoundError(f"Model weights not found: {weights_path}")
    if not data_path.is_file() or data_path.suffix.lower() not in (".yaml", ".yml"):
        raise FileNotFoundError(f"Provide an existing local dataset YAML file: {data_path}")
    if split not in ("val", "test"):
        raise ValueError("Evaluation split must be val or test.")
    if min(image_size, batch_size) < 1:
        raise ValueError("Image size and batch size must be positive integers.")

    from ultralytics import YOLO
    from ultralytics.data.utils import check_det_dataset

    dataset = check_det_dataset(str(data_path), autodownload=False)
    if not dataset.get(split):
        raise ValueError(f"Dataset YAML does not define a {split} split.")
    # Older YOLO versions check only val here, so also verify the selected test split.
    image_paths = dataset[split]
    if isinstance(image_paths, str):
        image_paths = [image_paths]
    for image_path in image_paths:
        if not Path(image_path).exists():
            raise FileNotFoundError(f"Local {split} images not found: {image_path}")
    detector = YOLO(str(weights_path))
    if detector.task != "detect":
        raise ValueError("Evaluation requires an object detection checkpoint.")
    output_directory = PROJECT_ROOT / "outputs/evaluation"
    output_directory.mkdir(parents=True, exist_ok=True)
    metrics = detector.val(
        data=str(data_path), split=split, imgsz=image_size, batch=batch_size,
        device=device, project=str(output_directory), name="snacks", exist_ok=False,
        workers=0,
    )
    return {
        "precision": float(metrics.box.mp),
        "recall": float(metrics.box.mr),
        "mAP50": float(metrics.box.map50),
        "mAP50-95": float(metrics.box.map),
    }


def main() -> None:
    """Print the four built-in metrics for a validation or test split."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--weights", type=Path, required=True)
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--split", choices=("val", "test"), default="val")
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=8)
    parser.add_argument("--device", default="cpu")
    args = parser.parse_args()
    try:
        metrics = evaluate_model(
            args.weights, args.data, args.split, args.imgsz, args.batch, args.device
        )
    except Exception as error:
        parser.exit(1, f"Evaluation failed: {error}\n")
    except KeyboardInterrupt:
        parser.exit(130, "Evaluation stopped.\n")
    for name, value in metrics.items():
        print(f"{name}: {value:.4f}")


if __name__ == "__main__":
    main()
