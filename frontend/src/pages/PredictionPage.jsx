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
    year: 2027,
    asking_rent: "",
  });

  const [result, setResult] = useState(null);
  const [locations, setLocations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [bedroomOptions, setBedroomOptions] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function loadData() {
      try {
        const [locationsRes, propertyRes, bedroomRes] =
          await Promise.all([
            axios.get("http://127.0.0.1:8000/locations"),
            axios.get(
              "http://127.0.0.1:8000/property-types"
            ),
            axios.get("http://127.0.0.1:8000/bedrooms"),
          ]);

        setLocations(locationsRes.data);
        setPropertyTypes(propertyRes.data);
        setBedroomOptions(bedroomRes.data);
      } catch (error) {
        console.error("Could not load form options:", error);
        setErrorMessage(
          "Could not load property options from the backend."
        );
      }
    }

    loadData();
  }, [navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    
    event.preventDefault();
    
    setIsLoading(true);
    setErrorMessage("");
    setResult(null);

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

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
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error("Prediction failed:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        alert(
          "Your login session has expired. Please log in again."
        );

        navigate("/login", { replace: true });
      } else {
        const backendMessage =
          error.response?.data?.detail;

        setErrorMessage(
          backendMessage ||
            "Could not complete the prediction. Please check that the backend is running."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  const hasAskingRent =
    result &&
    result.asking_rent !== undefined &&
    result.asking_rent !== null;

  const assessmentClass =
    hasAskingRent && result.assessment
      ? result.assessment
          .toLowerCase()
          .replaceAll(" ", "-")
      : "";

  return (
    <div className="page">
      <nav className="navbar">
        <div className="logo">🏡 RentWise</div>

        <div className="navbar-actions">
        <button
          type="button"
          className="nav-button"
          onClick={() => navigate("/history")}
        >
          History
        </button>

        <button
          type="button"
          className="nav-button"
          onClick={() => navigate("/profile")}
        >
          Profile
        </button>

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
        <h1>
          Predict Irish rental prices with machine learning
        </h1>

        <p>
          Enter property details and optionally compare the
          asking rent with the predicted market rent.
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
              {propertyTypes.length === 0 ? (
                <option value={formData.property_type}>
                  {formData.property_type}
                </option>
              ) : (
                propertyTypes.map((propertyType) => (
                  <option
                    key={propertyType}
                    value={propertyType}
                  >
                    {propertyType}
                  </option>
                ))
              )}
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
              {bedroomOptions.length === 0 ? (
                <option
                  value={formData.number_of_bedrooms}
                >
                  {formData.number_of_bedrooms}
                </option>
              ) : (
                bedroomOptions.map((bedroom) => (
                  <option
                    key={bedroom}
                    value={bedroom}
                  >
                    {bedroom}
                  </option>
                ))
              )}
            </select>

            <label htmlFor="year">Year</label>

            <input
              id="year"
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              min="2025"
              max="2060"
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

            {errorMessage && (
              <p className="auth-message error-message">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? "Predicting..."
                : "Predict Rent"}
            </button>
          </form>
        </section>

        <section className="card result-card">
          <h2>Prediction Result</h2>

          {!result ? (
            <div className="empty-state">
              <div className="icon">📊</div>

              <p>
                {isLoading
                  ? "Calculating your prediction..."
                  : "Your prediction will appear here."}
              </p>
            </div>
          ) : (
            <>
              <div className="rent-value">
                €
                {Number(
                  result.predicted_monthly_rent
                ).toLocaleString("en-IE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>

              <p className="muted">
                Predicted monthly rent
              </p>

              {hasAskingRent && (
                <>
                  <div
                    className={`badge ${assessmentClass}`}
                  >
                    {result.assessment}
                  </div>

                  <div className="summary-grid">
                    <div>
                      <span>Asking Rent</span>

                      <strong>
                        €
                        {Number(
                          result.asking_rent
                        ).toLocaleString("en-IE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </div>

                    <div>
                      <span>Difference</span>

                      <strong>
                        €
                        {Number(
                          result.difference
                        ).toLocaleString("en-IE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
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