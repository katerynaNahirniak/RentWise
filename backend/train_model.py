from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


# Project root
BASE_DIR = Path(__file__).resolve().parent.parent

# Paths
DATA_PATH = BASE_DIR / "data" / "processed" / "rentwise_cleaned.csv"
MODEL_PATH = BASE_DIR / "models" / "rentwise_model.pkl"
METRICS_PATH = BASE_DIR / "models" / "rentwise_model_metrics.json"

# Features
FEATURES = [
    "Location",
    "Property Type",
    "Number of Bedrooms",
    "Year",
]

TARGET = "VALUE"


def train_model():
    print("Loading dataset...", flush=True)

    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found:\n{DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    print(f"Dataset loaded ({len(df)} rows).", flush=True)

    X = df[FEATURES]
    y = df[TARGET]

    print("Splitting dataset...", flush=True)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
    )

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                [
                    "Location",
                    "Property Type",
                    "Number of Bedrooms",
                ],
            ),
            (
                "numeric",
                "passthrough",
                ["Year"],
            ),
        ]
    )

    pipeline = Pipeline(
        steps=[
            (
                "preprocessor",
                preprocessor,
            ),
            (
                "model",
                RandomForestRegressor(
                    n_estimators=30,   # Faster while testing
                    random_state=42,
                    n_jobs=-1,
                    verbose=1,
                ),
            ),
        ]
    )

    print("Training model...", flush=True)

    pipeline.fit(X_train, y_train)

    print("Making predictions...", flush=True)

    predictions = pipeline.predict(X_test)

    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    r2 = r2_score(y_test, predictions)

    metrics = {
        "rows": len(df),
        "training_rows": len(X_train),
        "testing_rows": len(X_test),
        "mae": float(mae),
        "rmse": float(rmse),
        "r2": float(r2),
    }

    MODEL_PATH.parent.mkdir(exist_ok=True)

    joblib.dump(pipeline, MODEL_PATH)

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=4)

    print("\n==============================")
    print("Training completed successfully!")
    print("==============================")
    print(f"MAE : {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    print(f"R²  : {r2:.3f}")
    print(f"\nModel saved to:\n{MODEL_PATH}")
    print(f"\nMetrics saved to:\n{METRICS_PATH}")


if __name__ == "__main__":
    train_model()