# ShelfAware snack vision prototype

A small Python module for experimenting with packaged product detection using
Ultralytics YOLO and OpenCV. It detects multiple objects in an image and returns
plain `Detection` objects. Webcam display and annotation are optional.

**Training on the lab RTX 4090?** Follow [LAB_TRAINING.md](LAB_TRAINING.md) for
clone commands, CUDA setup, a GPU calculation check, dataset transfer/download,
and the training command for that machine.

**No snack-trained weights are included.** Train on an annotated dataset first.
The default training starting point, `yolo11n.pt`, is a small generic pretrained
detector; it does not already identify Lay's, Doritos, Cheetos, or specific flavours.
Product recognition depends on the classes and examples in your training dataset.

## 1. Set up Python

Use **Python 3.11 or newer**. From this project folder in Windows PowerShell:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If you do not have the `py` launcher, use `python -m venv .venv` after checking
`python --version`. If PowerShell blocks activation, skip activation and run
commands with `.\.venv\Scripts\python.exe` in place of `python`.

On Linux:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Ultralytics installs PyTorch and other dependencies, so installation can be large.
Use the regular `opencv-python` package because the preview windows require a GUI.
NumPy is listed explicitly because the public detector accepts OpenCV NumPy images.
PyYAML handles dataset path preparation, and Requests handles explicit dataset
downloads. Tests use Python's standard library.

## 2. Prepare a dataset

Start with the [Lamar university grocery dataset on Roboflow Universe](https://universe.roboflow.com/lamar-university-venef/grocery-rfn8l).
Choose a dataset version, inspect its actual classes, download a **YOLO object
detection** export (for example, YOLOv8 format), and extract it into
`datasets/grocery/`. A Roboflow account may be needed to download it.

Follow [datasets/README.md](datasets/README.md) for the folder layout and YAML path
setup. Keep the exported `names` and class order intact. The training script reads
these labels directly; it does not impose a list of snack names.

You can also prepare a copied dataset or explicitly request a download:

```powershell
python scripts/prepare_dataset.py
python scripts/prepare_dataset.py --download
```

The first command configures an existing `datasets/grocery/` export for this
machine. The second downloads version 9 and prompts privately for a Roboflow key;
`--archive path/to/grocery-v9.zip` extracts an existing ZIP instead. These commands
preserve class labels and set the local YAML paths. Dataset download is never
triggered by training or evaluation, which require a prepared local YAML.

## 3. Train a model

From the project root:

```powershell
python training/train.py --data datasets/grocery/data.yaml --model yolo11n.pt --epochs 50 --imgsz 640 --batch 8 --device cpu
```

The first use of a recognized pretrained identifier downloads its small starting
checkpoint. For offline training, provide an existing checkpoint instead:

```powershell
python training/train.py --data datasets/grocery/data.yaml --model weights/yolo11n.pt --epochs 50 --batch 4 --name experiment2
```

`--epochs`, `--imgsz`, `--batch`, `--device`, `--name`, and `--workers` are optional. CPU is the
default and can be slow. With a working CUDA-enabled PyTorch installation,
`--device 0` selects the first GPU. Lower the batch size if memory runs out.
Data loader workers default to zero to keep Windows execution straightforward;
try `--workers 4` on the lab machine. `--batch -1` enables AutoBatch on CUDA.
Use the lab setup guide to install GPU-enabled PyTorch before requesting a GPU.

The first default run saves under:

```text
outputs/training/snacks/
    weights/best.pt
    weights/last.pt
    results.csv
    ...training plots and configuration...
```

Later runs get incremented names such as `snacks2`. **Use the actual `best.pt`
path printed after training.** Pass that path directly with `--weights`, or copy
it to the default inference location:

```powershell
Copy-Item outputs/training/snacks/weights/best.pt weights/best.pt
```

Training starts only when you run the training command. Importing modules does
not train a model or open a camera. See the official
[YOLO11 model reference](https://docs.ultralytics.com/models/yolo11/) and
[training guide](https://docs.ultralytics.com/modes/train/) for model and argument details.

## 4. Evaluate

```powershell
python training/evaluate.py --weights weights/best.pt --data datasets/grocery/data.yaml
python training/evaluate.py --weights weights/best.pt --data datasets/grocery/data.yaml --split test
```

The second command requires a `test:` entry and local test images in your YAML.
Use the same class IDs and names as training. Optional flags include `--imgsz`,
`--batch`, and `--device`.

The script prints Ultralytics' built-in mean precision, mean recall, mAP50, and
mAP50-95, as values between zero and one. Precision describes how often detections
are correct; recall describes how many labelled objects are found. mAP50 measures
class and box accuracy at an intersection-over-union threshold of 0.50; mAP50-95
averages across thresholds from 0.50 to 0.95 and demands tighter boxes.
These are dataset metrics, not the confidence score shown for one prediction.
Evaluation artifacts are saved under `outputs/evaluation/snacks/` (incremented
on repeated runs). Metrics use the [built-in validation API](https://docs.ultralytics.com/modes/val/).

## 5. Test images, videos, and a webcam

Copy your own photos and videos into a `samples/` folder, or supply an absolute
path. Use your trained checkpoint:

```powershell
python scripts/test_detection.py --source image --input samples/test.jpg
python scripts/test_detection.py --source image --input samples/test.jpg --weights weights/best.pt --confidence 0.6 --save
python scripts/test_detection.py --source image --input samples/test.jpg --save outputs/phone-result.jpg --no-display
python scripts/test_detection.py --source video --input samples/test.mp4
python scripts/test_detection.py --source webcam --device-index 0
```

For an image, the script prints detections and opens an annotated window. Press
any key to close it. `--save` alone writes `outputs/detection.jpg`; supply a path
to choose a different name. Existing image output files are replaced, so use a
new name to keep earlier results. `--no-display` allows image testing without a
desktop window. `--save` and `--no-display` apply to images only.

For video and webcam, press **Q** or close the window to stop. A file also stops
at the end. Camera resources are released even if detection raises an error.
If the webcam cannot open, try `--device-index 1`, check Windows camera privacy
permissions, and close other applications using the camera.

Relative paths you supply are relative to your current working directory.
Default weights and output folders are anchored to this project folder. Parent
output folders are created as needed. Quote paths containing spaces.

Run any script with `--help` to see its options. Missing weights produce a clear
error; inference never silently downloads a generic model as a replacement.

## 6. Test real phone photographs

Take fresh photos of products that appear in the training labels. Try single
items, several items together, different distances, shelf backgrounds, glare,
occlusion, and front/back views. Export JPEG or PNG images; convert HEIC first.
Transfer them locally and run the image command above. Compare the printed names
and drawn boxes with the actual products. Try a few confidence thresholds to
observe missed products and false detections.

Include empty scenes and products absent from training to reveal false positives.
An unsupported product can still be misclassified as a known product. Confidence
alone is not a reliable unknown-product filter.

For quantitative phone-photo evaluation, annotate every target object with boxes
and the existing class IDs, and create a separate YOLO test split. Then evaluate
with `--split test`. Keep test photos out of training; avoid near-duplicate shots
of the same scene across splits. Unlabelled photos support visual checks only,
not precision/recall or mAP measurement.

## 7. Import into another Python application

When running from this project root:

```python
from vision.detector import SnackDetector

detector = SnackDetector("weights/best.pt", confidence_threshold=0.5)
for detection in detector.detect("samples/test.jpg"):
    print(detection.label, detection.confidence, detection.bounding_box)
```

The detector also accepts a nonempty `uint8` NumPy array in OpenCV's BGR format.
It returns `list[Detection]`; an image without detections returns `[]`.
Bounding boxes are floating-point `(x1, y1, x2, y2)` coordinates in the original
image's pixels; `class_id` and `label` come from the loaded checkpoint.

For an application outside this folder, add this project root to its Python
import path (or copy the `vision/` package into that project) and install these
dependencies in that application's environment. For example:

```python
from pathlib import Path
import sys

snack_vision_root = Path("D:/ShelfAware")  # Change to your checkout location.
sys.path.insert(0, str(snack_vision_root))

from vision.detector import SnackDetector

detector = SnackDetector(snack_vision_root / "weights/best.pt")

def identify_products(photo_path: str) -> list[str]:
    """A small example of using detection in another application's workflow."""
    return [item.label for item in detector.detect(photo_path)]
```

Construct the detector once and reuse it. Drawing is separate:
`vision.visualization.draw_detections(image, detections)` returns an annotated
copy. Model-specific result handling stays inside `vision/detector.py`.

## 8. Code layout and checks

```text
vision/                 Reusable detector, Detection dataclass, camera, drawing
training/train.py       Fine-tuning command and train_model() function
training/evaluate.py    Evaluation command and evaluate_model() function
scripts/test_detection.py  Manual image/video/webcam command
scripts/setup_training.py  CUDA environment setup and GPU calculation check
scripts/prepare_dataset.py  Explicit download/extraction and local dataset paths
tests/test_vision.py    Small unittest suite with mocked model results
tests/test_lab_setup.py Offline checks for setup, dataset preparation, and downloads
datasets/README.md     Manual download and annotation preparation
LAB_TRAINING.md         RTX 4090 lab workflow for Windows and Linux
weights/               Your local trained checkpoints (ignored by Git)
outputs/               Training, evaluation, and image results (ignored by Git)
```

```powershell
python -m unittest discover -s tests -v
```

Tests use Python's standard library and do not train, download weights, access a
webcam, or open preview windows. Model predictions and capture devices are mocked.

This prototype has no bundled dataset or trained accuracy claim. Results depend
on label quality, class balance, and how closely training images resemble your
camera images. It does not perform inventory tracking or update another system.
