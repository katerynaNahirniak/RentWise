import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const [userResponse, predictionsResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000/users/me", config),
          axios.get("http://127.0.0.1:8000/predictions", config),
        ]);

        setUser(userResponse.data);
        setPredictions(predictionsResponse.data);
      } catch (error) {
        console.error(error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
        } else {
          setErrorMessage("Could not load your profile.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  const totalPredictions = predictions.length;

  const averagePrediction =
    totalPredictions > 0
      ? predictions.reduce(
          (sum, prediction) =>
            sum + Number(prediction.predicted_rent),
          0
        ) / totalPredictions
      : 0;

  const latestPrediction =
    totalPredictions > 0
      ? [...predictions].sort(
          (a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        )[0]
      : null;

  return (
    <div className="page">
      <nav className="navbar">
        <div
          className="logo"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/")}
        >
          🏡 RentWise
        </div>

        <div className="navbar-actions">
          <button
            className="nav-button"
            onClick={() => navigate("/")}
          >
            Predict
          </button>

          <button
            className="nav-button"
            onClick={() => navigate("/history")}
          >
            History
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <section className="hero">
        <h1>Profile</h1>
        <p>View your RentWise account and prediction summary.</p>
      </section>

      <main className="profile-container">
        {isLoading && (
          <section className="card">
            <p>Loading profile...</p>
          </section>
        )}

        {errorMessage && (
          <section className="card">
            <p>{errorMessage}</p>
          </section>
        )}

        {!isLoading && !errorMessage && user && (
          <section className="card profile-card">
            <div className="profile-header">


              <div>

                <h2 className="profile-email">
                  {user.email}
                </h2>

                <p className="profile-subtitle">
                  Your RentWise account and prediction summary.
                </p>
              </div>
            </div>

            <div className="profile-stats-grid">
              <div className="profile-stat">
                <span>Total Predictions: </span>
                <strong>{totalPredictions}</strong>
              </div>

              <div className="profile-stat">
                <span>Average Prediction: </span>
                <strong>
                  {totalPredictions > 0
                    ? `€${averagePrediction.toLocaleString("en-IE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "No data"}
                </strong>
              </div>

              <div className="profile-stat">
                <span>Last Prediction: </span>
                <strong>
                  {latestPrediction
                    ? new Date(
                        latestPrediction.created_at
                      ).toLocaleDateString("en-IE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "None"}
                </strong>
              </div>
            </div>

            {latestPrediction && (
              <>
                <hr />

                <h3>Latest Prediction: </h3>

                <div className="recent-prediction-details">
                  <div>
                    <span>Location</span>
                    <strong>{latestPrediction.location}</strong>
                  </div>

                  <div>
                    <span>Property Type: </span>
                    <strong>{latestPrediction.property_type}</strong>
                  </div>

                  <div>
                    <span>Bedrooms: </span>
                    <strong>
                      {latestPrediction.number_of_bedrooms}
                    </strong>
                  </div>

                  <div>
                    <span>Predicted Rent: </span>
                    <strong>
                      €
                      {Number(
                        latestPrediction.predicted_rent
                      ).toLocaleString("en-IE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                </div>
              </>
            )}

            <hr />

            <div className="profile-tip">
              <div className="profile-tip-icon">💡</div>

              <div>
                <h3>RentWise Tip</h3>

                <p>
                  Predictions are estimates based on historical Irish
                  rental market data. For the best results, enter the
                  correct location, property type, bedroom count and
                  prediction year.
                </p>
              </div>
            </div>

            <div className="profile-action-buttons">
              <button
                type="button"
                onClick={() => navigate("/")}
              >
                Predict Rent
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default ProfilePage;