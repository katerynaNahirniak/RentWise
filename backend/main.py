from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

app = FastAPI(title="RentWise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "rentwise_model.pkl"

model = joblib.load(MODEL_PATH)
dataset = pd.read_csv("data/processed/rentwise_cleaned.csv")

@app.get("/locations")
def get_locations():
    locations = sorted(dataset["Location"].dropna().unique().tolist())
    return locations


@app.get("/property-types")
def get_property_types():
    property_types = sorted(dataset["Property Type"].dropna().unique().tolist())
    return property_types


@app.get("/bedrooms")
def get_bedrooms():
    bedrooms = sorted(dataset["Number of Bedrooms"].dropna().unique().tolist())
    return bedrooms

class RentPredictionRequest(BaseModel):
    location: str
    property_type: str
    number_of_bedrooms: str
    year: int
    asking_rent: Optional[float] = None


@app.get("/")
def home():
    return {"message": "RentWise API is running"}


@app.post("/predict")
def predict_rent(request: RentPredictionRequest):

    input_data = pd.DataFrame([{
        "Location": request.location,
        "Property Type": request.property_type,
        "Number of Bedrooms": request.number_of_bedrooms,
        "Year": request.year
    }])

    predicted_rent = float(model.predict(input_data)[0])

    if request.asking_rent is None or request.asking_rent <= 0:
        return {
            "predicted_monthly_rent": round(predicted_rent, 2)
        }

    difference = request.asking_rent - predicted_rent

    if difference > 100:
        assessment = "Overpriced"
    elif difference < -100:
        assessment = "Underpriced"
    else:
        assessment = "Fairly priced"

    return {
        "predicted_monthly_rent": round(predicted_rent, 2),
        "asking_rent": request.asking_rent,
        "difference": round(difference, 2),
        "assessment": assessment
    }