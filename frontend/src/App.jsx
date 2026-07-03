import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
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
        const locationsRes = await axios.get("http://127.0.0.1:8000/locations");
        const propertyRes = await axios.get("http://127.0.0.1:8000/property-types");
        const bedroomRes = await axios.get("http://127.0.0.1:8000/bedrooms");

        setLocations(locationsRes.data);
        setPropertyTypes(propertyRes.data);
        setBedroomOptions(bedroomRes.data);
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, []);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const requestData = {
      ...formData,
      year: Number(formData.year),
      asking_rent:
        formData.asking_rent === "" ? null : Number(formData.asking_rent),
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

  const hasAskingRent = result && result.asking_rent !== undefined;

  const assessmentClass =
    hasAskingRent && result.assessment
      ? result.assessment.toLowerCase().replace(" ", "-")
      : "";

  return (
    <div className="page">
      <nav className="navbar">
      <div className="logo">🏡 RentWise</div>
        <span>AI Rental Price Predictor</span>
      </nav>

      <section className="hero">
        <h1>Predict Irish rental prices with machine learning</h1>
        <p>
          Enter property details and optionally compare the asking rent with the
          predicted market rent.
        </p>
      </section>

      <main className="dashboard">
        <section className="card form-card">
          <h2>Property Details</h2>

          <form onSubmit={handleSubmit}>
            <label>Location</label>
            <input
              list="locations"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />

            <datalist id="locations">
              {locations.map((location) => (
                <option key={location} value={location} />
              ))}
            </datalist>

            <label>Property Type</label>
            <select
              name="property_type"
              value={formData.property_type}
              onChange={handleChange}
            >
              <option>Apartment</option>
              <option>Terrace house</option>
              <option>Semi detached house</option>
              <option>Detached house</option>
              <option>Other flats</option>
            </select>

            <label>Bedrooms</label>
            <select
              name="number_of_bedrooms"
              value={formData.number_of_bedrooms}
              onChange={handleChange}
            >
              <option>One bed</option>
              <option>Two bed</option>
              <option>Three bed</option>
              <option>Four plus bed</option>
              <option>All bedrooms</option>
            </select>

            <label>Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
            />

            <label>Asking Rent (€) — Optional</label>
            <input
              type="number"
              name="asking_rent"
              value={formData.asking_rent}
              onChange={handleChange}
              placeholder="Leave blank for prediction only"
            />

            <button type="submit">Predict Rent</button>
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
                €{result.predicted_monthly_rent}
              </div>
              <p className="muted">Predicted monthly rent</p>

              {hasAskingRent && (
                <>
                  <div className={`badge ${assessmentClass}`}>
                    {result.assessment}
                  </div>

                  <div className="summary-grid">
                    <div>
                      <span>Asking Rent</span>
                      <strong>€{result.asking_rent}</strong>
                    </div>

                    <div>
                      <span>Difference</span>
                      <strong>€{result.difference}</strong>
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

export default App;