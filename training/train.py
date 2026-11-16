"""Fine-tune a small pretrained YOLO model on a local detection dataset."""

import argparse
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def train_model(
    data: str | Path,
    model: str = "yolo11n.pt",
    epochs: int = 50,
    image_size: int = 640,
    batch_size: int = 8,
    device: str = "cpu",
    name: str = "snacks",
    workers: int = 0,
) -> Path:
    """Train using the YAML's own labels and return the resulting best.pt path."""
    data_path = Path(data).expanduser().resolve()
    if not data_path.is_file() or data_path.suffix.lower() not in (".yaml", ".yml"):
        raise FileNotFoundError(f"Provide an existing local dataset YAML file: {data_path}")
    if min(epochs, image_size) < 1 or (batch_size < 1 and batch_size != -1):
        raise ValueError("Epochs and image size must be positive; batch size must be positive or -1 for AutoBatch.")
    if workers < 0:
        raise ValueError("Data loader workers must be zero or greater.")
    if batch_size == -1 and device == "cpu":
        raise ValueError("AutoBatch requires a CUDA GPU. Choose a positive batch size for CPU training.")
    if not name or name in (".", "..") or "/" in name or "\\" in name or ":" in name:
        raise ValueError("Run name must be a simple folder name, such as snacks.")

    from ultralytics import YOLO
    from ultralytics.data.utils import check_det_dataset

    if device.isdecimal():
        import torch

        if not torch.cuda.is_available():
            raise RuntimeError(
                "CUDA is unavailable. On the lab machine, run python scripts/setup_training.py "
                "and verify the NVIDIA driver. Use --device cpu for CPU training."
            )
        if int(device) >= torch.cuda.device_count():
            raise ValueError(f"GPU {device} was requested, but only {torch.cuda.device_count()} GPU(s) are visible.")

    # Fail on missing local data before YOLO can attempt a dataset download.
    check_det_dataset(str(data_path), autodownload=False)
    model_path = Path(model).expanduser()
    if model_path.is_file():
        model = str(model_path.resolve())
    elif model_path.parent != Path("."):
        raise FileNotFoundError(f"Model weights not found: {model_path.resolve()}")
    detector = YOLO(model)
    if detector.task != "detect":
        raise ValueError("Training requires an object detection model.")
    output_directory = PROJECT_ROOT / "outputs/training"
    output_directory.mkdir(parents=True, exist_ok=True)
    detector.train(
        data=str(data_path), epochs=epochs, imgsz=image_size, batch=batch_size,
        device=device, project=str(output_directory), name=name, exist_ok=False,
        workers=workers,
    )
    # Ultralytics increments an existing run name; use the actual saved directory.
    return Path(detector.trainer.save_dir).resolve() / "weights/best.pt"


def main() -> None:
    """Read training options without starting work when this module is imported."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, required=True, help="Local dataset YAML")
    parser.add_argument("--model", default="yolo11n.pt", help="Pretrained identifier or local weights")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=8, help="Batch size, or -1 for CUDA AutoBatch")
    parser.add_argument("--device", default="cpu", help="cpu, 0 for the first CUDA GPU, etc.")
    parser.add_argument("--name", default="snacks", help="Output run folder name")
    parser.add_argument("--workers", type=int, default=0, help="Data loader workers (try 4 on the lab machine)")
    args = parser.parse_args()
    try:
        best_weights = train_model(
            args.data, args.model, args.epochs, args.imgsz, args.batch, args.device, args.name,
            args.workers,
        )
    except Exception as error:
        parser.exit(1, f"Training failed: {error}\n")
    except KeyboardInterrupt:
        parser.exit(130, "Training stopped.\n")
    print(f"Best weights: {best_weights}")
    print("Pass this path with --weights for evaluation or detection.")


if __name__ == "__main__":
    main()
