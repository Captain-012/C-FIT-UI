import { useEffect, useState } from "react";
import "./Dashboard.css";
import { useLocation, useNavigate } from "react-router-dom";

export const Dashboard = () => {
    const [workouts, setWorkouts] = useState([]);
    const [workoutTotal, setWorkoutTotal] = useState(0);
    const [loadingWorkouts, setLoadingWorkouts] = useState(true);
    const [workoutError, setWorkoutError] = useState("");
    const [allWorkoutMinutes, setAllWorkoutMinutes] = useState(0);
    const [completedWorkoutTotal, setCompletedWorkoutTotal] = useState(0);
    const [totalCalories, setTotalCalories] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [userError, setUserError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const getUser = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login", { replace: true });
                    return;
                }

                const response = await fetch(
                    "http://localhost:4001/auth/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.status) {
                    throw new Error(
                        data.message || "Failed to load your account."
                    );
                }

                setUser(data.user);
            } catch (error) {
                setUserError(error.message || "Something went wrong.");
            } finally {
                setLoadingUser(false);
            }
        };

        getUser();
    }, [navigate]);


    const getWorkouts = async () => {
        try {
            setLoadingWorkouts(true);
            setWorkoutError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:4001/workouts?page=1&limit=5", 
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.status) {
                throw new Error(
                    data.message || "Failed to fetch workouts"
                );
            }

            setWorkouts(data.workouts);
            setWorkoutTotal(data.total);

        } catch (error) {
            console.error("Workout fetch error:", error);
            setWorkoutError(error.message);
        } finally {
            setLoadingWorkouts(false);
        }
    };
    const totalActiveMinutes = workouts.reduce(
        (total, workout) => total + workout.duration,
        0
    );
    const getWorkoutStatistics = async () => {
        try {
            const token = localStorage.getItem("token");

            // Fetch the first page to learn the total number of workouts
            const firstResponse = await fetch(
                "http://localhost:4001/workouts?page=1&limit=50",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const firstData = await firstResponse.json();

            if (!firstResponse.ok || !firstData.status) {
                throw new Error(firstData.message || "Failed to fetch workout statistics");
            }

            let allWorkouts = [...firstData.workouts];

            // Fetch additional pages if there are more than 50 workouts
            for (let page = 2; page <= firstData.totalPages; page++) {
                const response = await fetch(
                    `http://localhost:4001/workouts?page=${page}&limit=50`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.status) {
                    throw new Error(data.message || "Failed to fetch workout statistics");
                }

                allWorkouts = [...allWorkouts, ...data.workouts];
            }

            const completedWorkouts = allWorkouts.filter(
                (workout) => workout.isCompleted
            );

            setCompletedWorkoutTotal(completedWorkouts.length);
            const calories = completedWorkouts.reduce(
                (total, workout) => total + Number(workout.caloriesBurned || 0),
                0
            );

            setTotalCalories(calories);

            const minutes = completedWorkouts.reduce(
                (total, workout) => total + Number(workout.duration || 0),
                0
            );


            const completedDates = new Set(
                allWorkouts
                    .filter((workout) => workout.isCompleted && workout.completedAt)
                    .map((workout) => {
                        const date = new Date(workout.completedAt);

                        // Use the user's local calendar date
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, "0");
                        const day = String(date.getDate()).padStart(2, "0");

                        return `${year}-${month}-${day}`;
                    })
            );

            const getDateKey = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");

                return `${year}-${month}-${day}`;
            };

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let streak = 0;
            const lastTrainingDay = completedDates.has(getDateKey(today))
                ? today
                : completedDates.has(getDateKey(yesterday))
                    ? yesterday
                    : null;

            if (lastTrainingDay) {
                const checkDate = new Date(lastTrainingDay);

                while (completedDates.has(getDateKey(checkDate))) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                }
            }

            setCurrentStreak(streak);


            setAllWorkoutMinutes(minutes);

            setAllWorkoutMinutes(minutes);
        } catch (error) {
            console.error("Workout statistics error:", error);
        }
    };
  useEffect(() => {
    getWorkouts();
    getWorkoutStatistics();
}, [location.key]);


    return (
        <div className="dashboard-page">
            {loadingUser ? (
                <div
                    className="dashboard-loading"
                    role="status"
                    aria-live="polite"
                >
                    <span
                        className="dashboard-spinner"
                        aria-hidden="true"
                    />
                    <p>Getting your C-FIT dashboard ready...</p>
                </div>
            ) : userError ? (
                <div className="dashboard-load-error" role="alert">
                    <h2>We couldn't load your dashboard</h2>
                    <p>{userError}</p>
                    <button
                        className="panel-button"
                        onClick={() => navigate("/login")}
                    >
                        Return to Login
                    </button>
                </div>
            ) : (
                <>
                    <main className="dashboard-content">

                        <header className="dashboard-header">
                            <div>
                                <p className="dashboard-eyebrow">
                                    YOUR FITNESS OVERVIEW
                                </p>

                                <h1>
                                    Welcome back, {user.name} 👋
                                </h1>

                                <p className="dashboard-subtitle">
                                    Every rep counts. Let's make today stronger.
                                </p>
                            </div>

                            <div className="dashboard-date">
                                <span className="status-dot"></span>
                                You're ready to train
                            </div>
                        </header>

                        <section className="stats-grid">

                            <article className="stat-card">
                                <div className="stat-card-top">
                                    <span>Workouts</span>
                                    <span className="stat-icon">🏋️</span>
                                </div>

                                <h2>{completedWorkoutTotal}</h2>
                                <p>Workouts completed</p>
                            </article>

                            <article className="stat-card">
                                <div className="stat-card-top">
                                    <span>Active Minutes</span>
                                    <span className="stat-icon">⏱️</span>
                                </div>

                                <h2>
                                    {allWorkoutMinutes} <small>min</small>
                                </h2>
                                <p>Time spent in completed workouts</p>
                            </article>

                            <article className="stat-card">
                                <div className="stat-card-top">
                                    <span>Calories Burned</span>
                                    <span className="stat-icon">🔥</span>
                                </div>

                                <h2>{totalCalories}</h2>
                                <p>Estimated calories burned</p>
                            </article>

                            <article className="stat-card">
                                <div className="stat-card-top">
                                    <span>Current Streak</span>
                                    <span className="stat-icon">⚡</span>
                                </div>

                                <h2>
                                    {currentStreak} <small>days</small>
                                </h2>
                                <p>Consecutive training days</p>
                            </article>

                        </section>


                        <section className="dashboard-panels">

                            <article className="dashboard-panel workout-panel">
                                <div className="panel-heading">
                                    <div>
                                        <p className="panel-eyebrow">STAY CONSISTENT</p>
                                        <h2>Today's Workout</h2>
                                    </div>

                                    <span className="panel-icon">🏋️</span>
                                </div>

                                <div className="workout-preview">
                                    <span className="workout-tag">STRENGTH</span>
                                    <h3>Build Your Strength</h3>
                                    <p>
                                        Focus on building strength with a balanced
                                        full-body training session.
                                    </p>

                                    <div className="workout-details">
                                        <span>◷ 30 minutes</span>
                                        <span>⚡ Beginner</span>
                                    </div>
                                </div>

                                <button
                                    className="panel-button"
                                    onClick={() => navigate("/workouts")}
                                >
                                    Explore Workouts →
                                </button>
                            </article>


                            <article className="dashboard-panel coach-panel">
                                <div className="panel-heading">
                                    <div>
                                        <p className="panel-eyebrow">YOUR PERSONAL TRAINER</p>
                                        <h2>Meet Your AI Coach</h2>
                                    </div>

                                    <span className="panel-icon">🤖</span>
                                </div>

                                <div className="coach-content">
                                    <div className="coach-orb">AI</div>

                                    <h3>Training, made personal.</h3>

                                    <p>
                                        Get guidance tailored to your fitness goals,
                                        experience, and training preferences.
                                    </p>
                                </div>

                                <button
                                    className="panel-button"
                                    onClick={() => navigate("/coach")}
                                >
                                    Meet Your Coach →
                                </button>
                            </article>

                        </section>


                        <section className="recent-workouts">

                            <div className="section-heading">
                                <div>
                                    <p className="panel-eyebrow">YOUR TRAINING HISTORY</p>
                                    <h2>Recent Workouts</h2>
                                </div>

                                <button
                                    className="view-all-button"
                                    onClick={() => navigate("/workouts")}
                                >
                                    View All →
                                </button>
                            </div>


                            <div className="recent-workout-list">

                                {loadingWorkouts ? (
                                    <p>Loading your workouts...</p>
                                ) : workoutError ? (
                                    <p className="workout-error">{workoutError}</p>
                                ) : workouts.length === 0 ? (
                                    <div className="empty-workouts">
                                        <span className="empty-workout-icon">🏋️</span>

                                        <h3>Your fitness journey starts here</h3>

                                        <p>
                                            Your workouts will appear here when you
                                            start adding them.
                                        </p>

                                        <button
                                            className="panel-button"
                                            onClick={() => navigate("/workouts")}
                                        >
                                            Explore Workouts →
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <p className="workout-total">
                                            You have {workoutTotal} workout
                                            {workoutTotal === 1 ? "" : "s"} in total.
                                        </p>

                                        {workouts.map((workout) => (
                                            <article
                                                className="recent-workout-item"
                                                key={workout._id}
                                            >
                                                <div className="recent-workout-icon">
                                                    🏋️
                                                </div>

                                                <div className="recent-workout-info">
                                                    <h3>{workout.name}</h3>

                                                    <p>
                                                        {workout.category} · {workout.difficulty}
                                                    </p>
                                                </div>

                                                <span className="workout-duration">
                                                    {workout.duration} min
                                                </span>
                                            </article>
                                        ))}
                                    </>
                                )}

                            </div>

                        </section>
                    </main>

                </>
            )}
        </div>
    );

};