# Train on the lab RTX 4090

Use this guide on the lab computer. Setup creates a project-local `.venv`,
installs CUDA-enabled PyTorch, and runs a small GPU calculation before reporting
success. Dataset preparation and training are separate commands.

You need Git, **Python 3.11** (3.12 also works with this setup), an NVIDIA driver,
and permission to use the lab GPU. Run `nvidia-smi` first: it should list the RTX
4090. If it fails, ask the lab administrator to check the driver. The setup uses
PyTorch's prebuilt CUDA runtime; a separate CUDA Toolkit installation is not
needed for this prototype's standard PyTorch operations.

Allow space for CUDA PyTorch, the approximately 2.45 GB dataset ZIP, its extracted
images, and training outputs. Keep the lab session awake while training.

## 1. Clone and set up

```text
git clone --branch prototypes https://github.com/navdishabhakri/ShelfAware.git
cd ShelfAware
```

On Windows PowerShell:

```powershell
py -3.11 scripts/setup_training.py
```

On Linux:

```bash
python3.11 scripts/setup_training.py
```

If your `python` command already runs Python 3.11 or newer, it can be used instead
of `py -3.11` or `python3.11`. Internet access is needed for package installation.
Cloning a private repository also requires your authorized GitHub access.

The script installs a matched pair of **PyTorch 2.14.1 / torchvision 0.29.1**
from the official CUDA 12.6 wheel index, then installs `requirements.txt`. It
prints the PyTorch CUDA version, GPU name, memory, and a successful computation.
It replaces an existing CPU-only PyTorch installation inside this clone's `.venv`.

If the driver cannot run this CUDA build, use the lab's supported driver or
consult the [official PyTorch installer](https://pytorch.org/get-started/locally/).
The setup also accepts `--cuda cu130` and `--cuda cu132` for compatible drivers;
a newer CUDA build is not required just because the GPU is fast. The pinned
package pair and indexes follow [PyTorch's published installation commands](https://pytorch.org/get-started/previous-versions/).

To check an existing installation without reinstalling packages:

```powershell
.\.venv\Scripts\python.exe scripts/setup_training.py --check
```

On Linux use `.venv/bin/python` in place of `.\.venv\Scripts\python.exe` in
all subsequent commands. Activation is optional when using these explicit paths.

## 2. Get the dataset

The dataset, API keys, virtual environment, and trained checkpoints are excluded
from Git. Choose **one** of these options.

**Download on the lab machine:**

```powershell
.\.venv\Scripts\python.exe scripts/prepare_dataset.py --download
```

This requests grocery dataset **version 9** in YOLOv8 format. It prompts for your
private Roboflow key without echoing it; copy the key from
[Roboflow API settings](https://app.roboflow.com/settings/api). It is used for
the request and is not saved. An existing `ROBOFLOW_API_KEY` environment variable
also works. Do not put credentials into Git or a command-line argument.

The command waits for the export, prints download progress, extracts it into
`datasets/grocery/`, and sets `data.yaml` paths for this machine. It preserves
class names and annotation files. Raw network exceptions and signed download
URLs are not printed. Downloading is explicit and never triggered by training.

**Copy the ZIP from this computer:**

The archive already downloaded here is
`D:\ShelfAware\.tools\grocery-v9.zip`. Copy it to the lab computer using your
usual transfer method, then run (adjust the archive path):

```powershell
.\.venv\Scripts\python.exe scripts/prepare_dataset.py --archive "C:\Users\you\Downloads\grocery-v9.zip"
```

On Linux, for example:

```bash
.venv/bin/python scripts/prepare_dataset.py --archive /home/you/Downloads/grocery-v9.zip
```

**Copy the extracted dataset:**

Copy the full `datasets/grocery/` folder into the same location in the lab clone,
then run:

```powershell
.\.venv\Scripts\python.exe scripts/prepare_dataset.py
```

This last command only updates local paths and checks the split directories.
It fixes a copied Windows `D:/ShelfAware/...` path when the lab clone is elsewhere
or on Linux. It saves the original YAML as `data.original.yaml` on first use.
The helper expects the Roboflow `train/`, `valid/` (or `val/`), and optional
`test/` directories, each containing `images/` and `labels/`.

The version 9 archive fetched for this prototype contains 35,380 images, 62
classes, and polygon annotations. YOLO derives enclosing detection boxes from
those polygons. The script reports the actual downloaded counts and labels.

## 3. Start GPU training

On Windows:

```powershell
.\.venv\Scripts\python.exe training/train.py --data datasets/grocery/data.yaml --model yolo11n.pt --device 0 --batch 32 --workers 4 --epochs 50 --imgsz 640 --name lab4090
```

On Linux:

```bash
.venv/bin/python training/train.py --data datasets/grocery/data.yaml --model yolo11n.pt --device 0 --batch 32 --workers 4 --epochs 50 --imgsz 640 --name lab4090
```

`--device 0` explicitly selects the first visible CUDA GPU; the training header
must show the expected RTX 4090. If the lab has several GPUs, select the index
corresponding to your assigned card. An unavailable requested GPU produces an
error rather than switching to a CPU run.

Batch 32 and four loader workers are starting settings, not a hardware guarantee.
If GPU memory runs out, try `--batch 16`, or use `--batch -1` for Ultralytics'
automatic batch sizing on CUDA. If data loading has multiprocessing or memory
problems, use `--workers 0`. No image cache is enabled by these commands. Start
with the same small YOLO11n model so its resulting checkpoint remains suitable
for CPU inference at home.

The pretrained `yolo11n.pt` is downloaded on first use. Training uses the real
class labels in `data.yaml`. The existing local CPU run and a fresh lab run are
independent experiments; this command starts fine-tuning from YOLO11n again.

See the [Ultralytics training options](https://docs.ultralytics.com/modes/train/)
for GPU selection, batch sizing, and workers.

## 4. Evaluate and bring the result home

The first lab run saves:

```text
outputs/training/lab4090/weights/best.pt
outputs/training/lab4090/weights/last.pt
outputs/training/lab4090/results.csv
outputs/training/lab4090/args.yaml
```

Repeated runs get incremented names. Use the actual path printed after training.
Evaluate on the held-out test split:

```powershell
.\.venv\Scripts\python.exe training/evaluate.py --weights outputs/training/lab4090/weights/best.pt --data datasets/grocery/data.yaml --split test --device 0 --batch 32
```

Copy `best.pt`, the run's `args.yaml` and `results.csv` back to your own machine.
Put `best.pt` at `weights/best.pt` here, then run:

```powershell
.\.venv\Scripts\python.exe scripts/test_detection.py --source image --input samples/test.jpg --weights weights/best.pt --save
```

The GPU-trained `.pt` checkpoint can be loaded for CPU inference. The lab's CUDA
environment does not need to be copied; use this computer's existing environment.
Keep `last.pt` and the run folder on the lab machine if you want to resume an
interrupted run on that same machine. For example, using the lab environment:

```powershell
.\.venv\Scripts\python.exe -c "from ultralytics import YOLO; YOLO('outputs/training/lab4090/weights/last.pt').train(resume=True, device=0)"
```

This resumes saved training settings rather than starting a fresh fine-tune.
If the job finished all its epochs, start a new experiment instead. These setup
scripts have no access to the lab hardware from here, so the GPU calculation on
the lab machine is the final check before a full run.
