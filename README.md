# MealPlanner

## setup
use python 3.10.12

### make virtual environment, this way we all are running the same versions of libraries in case there are any conflicsts
python -m venv .venv OR python3 -m venv .venv

### activate venv
source .venv/bin/activate

### install dependencies
pip install -r requirements.txt

### when adding/removing a new python library please add to requirements.txt then run:
pip freeze -l > requirements.txt