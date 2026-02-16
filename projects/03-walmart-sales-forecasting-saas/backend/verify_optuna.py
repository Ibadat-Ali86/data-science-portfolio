import sys
import os

# Add the parent directory to sys.path to allow importing 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from app.ml.hyperparameter_optimizer import OPTUNA_AVAILABLE
    if OPTUNA_AVAILABLE:
        print("SUCCESS: Optuna is available in hyperparameter_optimizer.")
    else:
        print("FAILURE: Optuna is NOT available in hyperparameter_optimizer.")
except ImportError as e:
    print(f"ERROR: Could not import hyperparameter_optimizer: {e}")
