# RentWise

RentWise is a full-stack web application that predicts residential rental prices in Ireland using a machine learning model. The system allows users to register, authenticate securely, generate rental price predictions, compare an asking rent with the predicted value, and view a history of previous predictions.

This project was developed as a Final Year Project for the **National College of Ireland**.

---

## Features

- User registration and login
- Secure JWT authentication
- Rental price prediction
- Asking rent comparison
- Prediction history
- User profile page

---

## Technologies Used

### Frontend
- React
- Vite
- React Router
- Axios

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication

### Machine Learning
- Python
- Scikit-learn
- Random Forest Regression
- Pandas
- NumPy
- Joblib

---

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

---

## Installation

### Clone the repository

```bash
git clone https://github.com/<your-username>/RentWise.git
cd RentWise
```

### Create a virtual environment

**Windows**

```bash
python -m venv .venv
.venv\Scripts\activate
```

**macOS / Linux**

```bash
python -m venv .venv
source .venv/bin/activate
```

### Install backend dependencies

```bash
pip install -r requirements.txt
```

### Install frontend dependencies

```bash
cd frontend
npm install
```

---

## Running the Application

### Start the backend

From the project root:

```bash
uvicorn backend.main:app --reload
```

The backend will be available at:

```
http://127.0.0.1:8000
```

API documentation:

```
http://127.0.0.1:8000/docs
```

### Start the frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
```

---

## Machine Learning Model

The application uses a **Random Forest Regression** model trained on historical rental data from the **Irish Residential Tenancies Board (RTB)**.

Model performance:

| Metric | Value |
|---------|------:|
| MAE | €61.89 |
| RMSE | €113.05 |
| R² Score | 0.947 |

To retrain the model:

```bash
python backend/train_model.py
```

---

## Database

SQLite is used to store:

- User accounts
- Prediction history

---

## Future Improvements

Potential future enhancements include:

- Support for additional property features
- Rental market trend visualisation
- Administrator dashboard
- Cloud deployment
- Automated model retraining

---

## Author

**Kateryna Nahirniak**

Final Year Project

National College of Ireland

---

## Licence

This project was developed for educational purposes as part of a university final year project.
