import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

function HistoryPage() {
  const navigate = useNavigate();

  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadHistory() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/predictions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPredictions(response.data);
      } catch (error) {
        console.error("Could not load prediction history:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
        } else {
          setErrorMessage("Could not load your prediction history.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <div className="page">
      <nav className="navbar">
        <div
          className="logo"
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
        >
          🏡 RentWise
        </div>

        <div className="navbar-actions">
          <button
            type="button"
            className="nav-button"
            onClick={() => navigate("/")}
          >
            Predict
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
        <h1>Prediction History</h1>
        <p>Review your previous rental price predictions.</p>
      </section>

      <main className="history-container">
        {isLoading && (
          <section className="card">
            <p>Loading your history...</p>
          </section>
        )}

        {errorMessage && (
          <section className="card">
            <p className="error-message">{errorMessage}</p>
          </section>
        )}

        {!isLoading &&
          !errorMessage &&
          predictions.length === 0 && (
            <section className="card empty-state">
              <div className="icon">📊</div>
              <h2>No predictions yet</h2>
              <p>
                Make your first rental prediction to see it here.
              </p>

              <button
                type="button"
                onClick={() => navigate("/")}
              >
                Make a prediction
              </button>
            </section>
          )}

        {!isLoading && predictions.length > 0 && (
          <div className="history-grid">
            {predictions.map((prediction) => (
              <section
                className="card history-card"
                key={prediction.id}
              >
                <div className="history-card-header">
                  <h2>{prediction.location}</h2>

                  <span>
                    {new Date(
                      prediction.created_at
                    ).toLocaleDateString("en-IE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="history-details">
                  <p>
                    <span>Property type</span>
                    <strong>{prediction.property_type}</strong>
                  </p>

                  <p>
                    <span>Bedrooms</span>
                    <strong>
                      {prediction.number_of_bedrooms}
                    </strong>
                  </p>

                  <p>
                    <span>Prediction year</span>
                    <strong>{prediction.year}</strong>
                  </p>

                  {prediction.asking_rent !== null && (
                    <p>
                      <span>Asking rent</span>
                      <strong>
                        €
                        {Number(
                          prediction.asking_rent
                        ).toLocaleString("en-IE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </p>
                  )}
                </div>

                <div className="history-rent">
                  <span>Predicted monthly rent</span>

                  <strong>
                    €
                    {Number(
                      prediction.predicted_rent
                    ).toLocaleString("en-IE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default HistoryPage;