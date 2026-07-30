import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

function PredictionPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    location: "Cork City",
    property_type: "Terrace house",
    number_of_bedrooms: "Three bed",
    year: 2021,
    asking_rent: "",
  });

  const [result, setResult] = useState(null);
  const [locations, setLocations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [bedroomOptions, setBedroomOptions] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [locationsRes, propertyRes, bedroomRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/locations"),
          axios.get("http://127.0.0.1:8000/property-types"),
          axios.get("http://127.0.0.1:8000/bedrooms"),
        ]);

        setLocations(locationsRes.data);
        setPropertyTypes(propertyRes.data);
        setBedroomOptions(bedroomRes.data);
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const requestData = {
      ...formData,
      year: Number(formData.year),
      asking_rent:
        formData.asking_rent === ""
          ? null
          : Number(formData.asking_rent),
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        requestData
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Could not connect to backend.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const hasAskingRent =
    result && result.asking_rent !== undefined;

  const assessmentClass =
    hasAskingRent && result.assessment
      ? result.assessment.toLowerCase().replace(" ", "-")
      : "";

  return (
    <div className="page">
      <nav className="navbar">
        <div className="logo">🏡 RentWise</div>

        <div className="navbar-actions">
          <span>AI Rental Price Predictor</span>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <section className="hero">
        <h1>Predict Irish rental prices with machine learning</h1>

        <p>
          Enter property details and optionally compare the asking rent
          with the predicted market rent.
        </p>
      </section>

      <main className="dashboard">
        <section className="card form-card">
          <h2>Property Details</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="location">Location</label>

            <input
              id="location"
              list="locations"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />

            <datalist id="locations">
              {locations.map((location) => (
                <option
                  key={location}
                  value={location}
                />
              ))}
            </datalist>

            <label htmlFor="property_type">
              Property Type
            </label>

            <select
              id="property_type"
              name="property_type"
              value={formData.property_type}
              onChange={handleChange}
              required
            >
              {propertyTypes.map((propertyType) => (
                <option
                  key={propertyType}
                  value={propertyType}
                >
                  {propertyType}
                </option>
              ))}
            </select>

            <label htmlFor="number_of_bedrooms">
              Bedrooms
            </label>

            <select
              id="number_of_bedrooms"
              name="number_of_bedrooms"
              value={formData.number_of_bedrooms}
              onChange={handleChange}
              required
            >
              {bedroomOptions.map((bedroom) => (
                <option
                  key={bedroom}
                  value={bedroom}
                >
                  {bedroom}
                </option>
              ))}
            </select>

            <label htmlFor="year">Year</label>

            <input
              id="year"
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              min="2008"
              max="2025"
              required
            />

            <label htmlFor="asking_rent">
              Asking Rent (€) — Optional
            </label>

            <input
              id="asking_rent"
              type="number"
              name="asking_rent"
              value={formData.asking_rent}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Leave blank for prediction only"
            />

            <button type="submit">
              Predict Rent
            </button>
          </form>
        </section>

        <section className="card result-card">
          <h2>Prediction Result</h2>

          {!result ? (
            <div className="empty-state">
              <div className="icon">📊</div>
              <p>Your prediction will appear here.</p>
            </div>
          ) : (
            <>
              <div className="rent-value">
                €
                {Number(
                  result.predicted_monthly_rent
                ).toLocaleString()}
              </div>

              <p className="muted">
                Predicted monthly rent
              </p>

              {hasAskingRent && (
                <>
                  <div className={`badge ${assessmentClass}`}>
                    {result.assessment}
                  </div>

                  <div className="summary-grid">
                    <div>
                      <span>Asking Rent</span>

                      <strong>
                        €
                        {Number(
                          result.asking_rent
                        ).toLocaleString()}
                      </strong>
                    </div>

                    <div>
                      <span>Difference</span>

                      <strong>
                        €
                        {Number(
                          result.difference
                        ).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </>
              )}

              <p className="explanation">
                {hasAskingRent
                  ? "This result compares the asking rent with the model's predicted market rent for similar property details."
                  : "This result shows the model's predicted market rent based on the selected property details."}
              </p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default PredictionPage;