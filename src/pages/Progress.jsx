import { useEffect, useState } from "react";
import "./Progress.css";
import API_URL from "../config/api.js";

const Progress = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getCompletedWorkouts = async () => {
      try {
        const token = localStorage.getItem("token");
        let allWorkouts = [];

        const firstResponse = await fetch(
          `${API_URL}/workouts?page=1&limit=50`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const firstData = await firstResponse.json();

        if (!firstResponse.ok || !firstData.status) {
          throw new Error(
            firstData.message || "Failed to load workout history"
          );
        }

        allWorkouts = [...firstData.workouts];

        for (let page = 2; page <= firstData.totalPages; page++) {
          const response = await fetch(
            `${API_URL}/workouts?page=${page}&limit=50`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();

          if (!response.ok || !data.status) {
            throw new Error(
              data.message || "Failed to load workout history"
            );
          }

          allWorkouts = [...allWorkouts, ...data.workouts];
        }

        const completed = allWorkouts
          .filter((workout) => workout.isCompleted && workout.completedAt)
          .sort(
            (a, b) =>
              new Date(b.completedAt) - new Date(a.completedAt)
          );

        setWorkouts(completed);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getCompletedWorkouts();
  }, []);

  const totalMinutes = workouts.reduce(
    (total, workout) => total + Number(workout.duration || 0),
    0
  );

  const totalCalories = workouts.reduce(
    (total, workout) => total + Number(workout.caloriesBurned || 0),
    0
  );

  return (
    <main className="progress-page">
      <header className="progress-header">
        <div>
          <p className="progress-eyebrow">YOUR FITNESS JOURNEY</p>
          <h1>Workout Progress</h1>
          <p>Track your effort, celebrate your wins.</p>
        </div>
      </header>


      {loading ? (
        <div className="progress-loading">
          <div className="progress-spinner"></div>
          <p>Loading your progress...</p>
        </div>
      ) : error ? (

        <p className="progress-error">{error}</p>
      ) : (
        <>
          <section className="progress-stats">
            <article className="progress-stat-card">
              <span>Completed Workouts</span>
              <h2>{workouts.length}</h2>
            </article>

            <article className="progress-stat-card">
              <span>Active Minutes</span>
              <h2>{totalMinutes} <small>min</small></h2>
            </article>

            <article className="progress-stat-card">
              <span>Estimated Calories</span>
              <h2>{totalCalories}</h2>
            </article>
          </section>

          <section className="progress-history">
            <h2>Workout History</h2>

            {workouts.length === 0 ? (
              <div className="progress-empty">
                <span>🏋️</span>
                <h3>Your journey starts here</h3>
                <p>
                  Completed workouts will appear here as you train.
                </p>
              </div>
            ) : (
              <div className="progress-history-list">
                {workouts.map((workout) => (
                  <article
                    className="progress-history-item"
                    key={workout._id}
                  >
                    <div className="progress-workout-icon">✓</div>

                    <div className="progress-workout-info">
                      <h3>{workout.name}</h3>
                      <p>
                        {workout.category} · {workout.difficulty}
                      </p>
                      <time dateTime={workout.completedAt}>
                        {new Date(workout.completedAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </time>
                    </div>

                    <div className="progress-workout-results">
                      <span>{workout.duration} min</span>
                      <span>
                        {workout.caloriesBurned || 0} kcal est.
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default Progress;
