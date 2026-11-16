# Prepare a local YOLO detection dataset

1. Open the [Lamar university grocery dataset](https://universe.roboflow.com/lamar-university-venef/grocery-rfn8l).
2. Inspect the class list and example boxes. Choose a dataset version and use its
   download/export option (sign in if asked).
3. Choose a **YOLO object detection** export with images, `.txt` labels, and
   `data.yaml`. Both box and polygon annotations in a YOLOv8 export are supported
   by the training loader. Avoid classification or hosted inference exports.
4. Download the ZIP manually and extract it into `datasets/grocery/`. Do not add
   another nesting level between `grocery/` and `data.yaml`.
5. Keep the dataset's attribution and export information with the local data.
   Record the version you used so experiments can be compared later.

Roboflow's [export documentation](https://docs.roboflow.com/datasets/exporting-data)
describes selecting the format and downloading a ZIP. If the browser stalls,
request the download explicitly from the project root:

```powershell
python scripts/prepare_dataset.py --download
```

This uses the official API to download version 9 in YOLOv8 format, prompts for
your private key without echoing it, extracts the archive, and fixes the local
YAML paths. It also accepts an existing `ROBOFLOW_API_KEY` environment variable.
The script does not save the key or print download credentials. Downloading
requires an empty destination and is never started by training or evaluation.

To use a ZIP copied from another machine, or update paths in a copied folder:

```powershell
python scripts/prepare_dataset.py --archive "path/to/grocery-v9.zip"
python scripts/prepare_dataset.py
```

Choose the appropriate command; use `--directory` if the extracted data belongs
somewhere other than `datasets/grocery/`. Existing labels and class names are
preserved. The helper keeps `data.original.yaml` as a backup. The manual YAML
instructions below are an alternative to this helper.

A typical export looks like this (some exports use `val/` instead of `valid/`):

```text
datasets/grocery/
    data.yaml
    train/
        images/...
        labels/...
    valid/
        images/...
        labels/...
    test/                 Optional
        images/...
        labels/...
```

Open `data.yaml` in a text editor. Set `path` to the **absolute dataset folder**,
using forward slashes on Windows, and make the split paths relative to it:

```yaml
path: D:/ShelfAware/datasets/grocery
train: train/images
val: valid/images
test: test/images

# Keep the existing names and nc entries from the downloaded export here.
```

That block shows only the path settings; it is **not a complete replacement
YAML**. Leave the exported `names:` and `nc:` entries unchanged. Remove `test:` if
there is no test split. Adjust `val:` if your folder is named `val/`. On Linux use
an absolute path such as `/home/you/ShelfAware/datasets/grocery`. Update `path`
when moving the dataset to another machine.

Avoid export paths such as `../train/images` unless they actually resolve within
your dataset layout. An explicit absolute root makes the dataset independent of
Ultralytics' global dataset-directory setting. Training and validation check for
local data before running and fail if required files are missing.

Each nonempty line in a detection label file uses:

```text
class_id x_center y_center width height
```

Coordinates are normalized to image dimensions, in the range 0 to 1. For example,
`0 0.5 0.5 0.4 0.6` is a centred box for class zero. Each image and label share
the same filename stem. A multi-product image has one line per labelled box.
Background-only images may have empty label files. See the
[Ultralytics detection dataset format](https://docs.ultralytics.com/datasets/detect/).

The grocery version 9 export uses polygon outlines: each row contains a class ID
followed by normalized `(x, y)` vertices. Ultralytics' dataset loader derives
enclosing boxes from these outlines when training an object detector. Keep these
original labels; they are supported by this project's training script.

The Roboflow project page lists product-specific classes, including Cheetos and
Doritos variants. Check **your downloaded version's** `names` to establish exactly
which snacks, flavours, and sizes are covered. Do not rename or reorder class IDs
without updating every annotation. A model cannot learn a flavour distinction
that the labels do not provide.

For your own phone photos, annotate boxes in a YOLO-compatible tool using the
same class order. Keep training, validation, and final test photos separate.
Record additional products as new classes only when you have enough labelled
examples and intend to retrain. All local datasets are ignored by Git.
