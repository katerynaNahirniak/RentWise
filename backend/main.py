from pathlib import Path
from typing import Optional

import joblib
import pandas as pd

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import (
    create_access_token,
    hash_password,
    verify_password,
)
from database import Base, engine, get_db
from dependencies import get_current_user
from models import Prediction, User
from schemas import (
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)

import models


Base.metadata.create_all(bind=engine)

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
DATASET_PATH = BASE_DIR / "data" / "processed" / "rentwise_cleaned.csv"

model = joblib.load(MODEL_PATH)
dataset = pd.read_csv(DATASET_PATH)


class RentPredictionRequest(BaseModel):
    location: str
    property_type: str
    number_of_bedrooms: str
    year: int
    asking_rent: Optional[float] = None


@app.get("/")
def home():
    return {"message": "RentWise API is running"}


@app.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    normalized_email = user_data.email.lower().strip()

    existing_user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    new_user = User(
        name=user_data.name.strip(),
        email=normalized_email,
        hashed_password=hash_password(user_data.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post(
    "/login",
    response_model=TokenResponse,
)
def login_user(
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    normalized_email = login_data.email.lower().strip()

    user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if user is None or not verify_password(
        login_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    access_token = create_access_token(
        subject=str(user.id)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@app.get(
    "/users/me",
    response_model=UserResponse,
)
def read_current_user(
    current_user: User = Depends(get_current_user),
):
    return current_user


@app.get("/locations")
def get_locations():
    return sorted(
        dataset["Location"]
        .dropna()
        .unique()
        .tolist()
    )


@app.get("/property-types")
def get_property_types():
    return sorted(
        dataset["Property Type"]
        .dropna()
        .unique()
        .tolist()
    )


@app.get("/bedrooms")
def get_bedrooms():
    return sorted(
        dataset["Number of Bedrooms"]
        .dropna()
        .unique()
        .tolist()
    )


@app.post("/predict")
def predict_rent(
    request: RentPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    input_data = pd.DataFrame(
        [
            {
                "Location": request.location,
                "Property Type": request.property_type,
                "Number of Bedrooms": request.number_of_bedrooms,
                "Year": request.year,
            }
        ]
    )

    try:
        predicted_rent = float(model.predict(input_data)[0])
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prediction failed: {str(error)}",
        ) from error

    saved_prediction = Prediction(
        user_id=current_user.id,
        location=request.location,
        property_type=request.property_type,
        number_of_bedrooms=request.number_of_bedrooms,
        year=request.year,
        asking_rent=request.asking_rent,
        predicted_rent=predicted_rent,
    )

    db.add(saved_prediction)
    db.commit()
    db.refresh(saved_prediction)

    response_data = {
        "prediction_id": saved_prediction.id,
        "predicted_monthly_rent": round(predicted_rent, 2),
    }

    if request.asking_rent is None or request.asking_rent <= 0:
        return response_data

    difference = request.asking_rent - predicted_rent

    if difference > 100:
        assessment = "Overpriced"
    elif difference < -100:
        assessment = "Underpriced"
    else:
        assessment = "Fairly priced"

    response_data.update(
        {
            "asking_rent": request.asking_rent,
            "difference": round(difference, 2),
            "assessment": assessment,
        }
    )

    return response_data


@app.get("/predictions")
def get_prediction_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    predictions = db.scalars(
        select(Prediction)
        .where(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
    ).all()

    return [
        {
            "id": prediction.id,
            "location": prediction.location,
            "property_type": prediction.property_type,
            "number_of_bedrooms": prediction.number_of_bedrooms,
            "year": prediction.year,
            "asking_rent": prediction.asking_rent,
            "predicted_rent": prediction.predicted_rent,
            "created_at": prediction.created_at,
        }
        for prediction in predictions
    ]