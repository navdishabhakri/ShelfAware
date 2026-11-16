"""Create a local virtual environment with CUDA-enabled PyTorch for lab training."""

import argparse
import os
from pathlib import Path
import subprocess
import sys
import venv


PROJECT_ROOT = Path(__file__).resolve().parents[1]
TORCH_PACKAGES = ("torch==2.14.1", "torchvision==0.29.1")
CUDA_BUILDS = ("cu126", "cu130", "cu132")
GPU_CHECK = """
import torch
print('PyTorch:', torch.__version__)
print('PyTorch CUDA runtime:', torch.version.cuda)
if not torch.cuda.is_available():
    raise SystemExit('CUDA is unavailable. Check the NVIDIA driver and CUDA PyTorch installation. '
                     'Run nvidia-smi and consult https://pytorch.org/get-started/locally/')
print('GPU:', torch.cuda.get_device_name(0))
print('GPU memory: %.1f GiB' % (torch.cuda.get_device_properties(0).total_memory / 1024**3))
# Run a small computation to check the driver/runtime, not just GPU discovery.
values = torch.ones((32, 32), device='cuda:0')
answer = (values @ values).sum().item()
torch.cuda.synchronize()
assert answer == 32768
print('CUDA computation passed. Ready for --device 0.')
"""


def setup_environment(cuda_build: str = "cu126", check_only: bool = False) -> Path:
    """Install into .venv, then verify that a real operation works on GPU zero."""
    if sys.version_info < (3, 11):
        raise RuntimeError("Use Python 3.11 or newer to run this setup script.")
    if cuda_build not in CUDA_BUILDS:
        raise ValueError(f"Choose a CUDA build from {CUDA_BUILDS}.")
    environment = PROJECT_ROOT / ".venv"
    python = environment / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    if not python.is_file():
        if check_only:
            raise FileNotFoundError("No .venv found. Run python scripts/setup_training.py first.")
        print(f"Creating environment: {environment}", flush=True)
        venv.create(environment, with_pip=True)
    if not check_only:
        subprocess.run([str(python), "-m", "pip", "install", "--upgrade", "pip"], check=True)
        # Force replacement so an existing CPU-only build cannot satisfy these versions.
        subprocess.run([
            str(python), "-m", "pip", "install", "--upgrade", "--force-reinstall",
            *TORCH_PACKAGES, "--index-url", f"https://download.pytorch.org/whl/{cuda_build}",
        ], check=True)
        subprocess.run([
            str(python), "-m", "pip", "install", "-r", str(PROJECT_ROOT / "requirements.txt"),
        ], check=True)
    subprocess.run([str(python), "-c", GPU_CHECK], check=True)
    return python


def main() -> None:
    """Install CUDA packages explicitly; setup never starts a training run."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cuda", choices=CUDA_BUILDS, default="cu126")
    parser.add_argument("--check", action="store_true", help="Only check the existing environment")
    args = parser.parse_args()
    try:
        python = setup_environment(args.cuda, args.check)
    except subprocess.CalledProcessError:
        parser.exit(1, "Setup failed. See the installation or GPU error above.\n")
    except (OSError, ValueError, RuntimeError) as error:
        parser.exit(1, f"Setup failed: {error}\n")
    print(f"Use this Python for dataset preparation and training: {python}")


if __name__ == "__main__":
    main()
