# RentWise

RentWise is a full-stack web application that uses a Random Forest Regression machine learning model to estimate residential rental prices in Ireland. The application allows users to register, log in, generate rental price predictions, compare asking rent with the predicted value, and view their prediction history.

## Features

- User registration and login
- Secure JWT authentication
- Rental price prediction
- Asking rent comparison
- Prediction history
- User profile management

## Technologies

### Frontend
- React
- Vite
- Axios
- React Router

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- Pydantic

### Machine Learning
- Python
- Scikit-learn
- Random Forest Regression
- Pandas
- NumPy
- Joblib

## Project Structure

```
RentWise/
├── backend/
├── frontend/
├── data/
├── models/
├── notebooks/
├── requirements.txt
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd RentWise
```

### 2. Create and activate a virtual environment

macOS / Linux

```bash
python -m venv .venv
source .venv/bin/activate
```

Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
```

## Running the Application

### Start the backend

From the project root:

```bash
uvicorn backend.main:app --reload
```

The API will be available at:

```
http://127.0.0.1:8000
```

Swagger documentation:

```
http://127.0.0.1:8000/docs
```

### Start the frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

## Machine Learning Model

The application uses a Random Forest Regression model trained on historical rental data from the Irish Residential Tenancies Board (RTB).

To retrain the model:

```bash
python backend/train_model.py
```

The trained model is saved to:

```
models/rentwise_model.pkl
```

## Database

The application uses SQLite for data storage.

The database stores:

- User accounts
- Prediction history

## Default Functionality

Authenticated users can:

- Generate rental price predictions
- Compare asking rent with the predicted rent
- View previous predictions
- View profile information

## Author

Kateryna Nahirniak

Final Project

National College of Ireland