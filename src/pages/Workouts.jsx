import { useEffect, useState } from "react";
import "./Workouts.css";
import Swal from "sweetalert2";

const Workouts = () => {

    // USE STATE DECLARATION...
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

    const [hours, setHours] = useState("0");
    const [minutes, setMinutes] = useState("30");

    const [editingWorkoutId, setEditingWorkoutId] = useState(null);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("");


    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "Strength",
        difficulty: "Beginner",
        duration: 30,
    });

    const [saving, setSaving] = useState(false);

    const fetchWorkouts = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const params = new URLSearchParams();

            if (search.trim()) {
                params.append("search", search.trim());
            }

            if (categoryFilter) {
                params.append("category", categoryFilter);
            }

            if (difficultyFilter) {
                params.append("difficulty", difficultyFilter);
            }

            const queryString = params.toString();

            const response = await fetch(
                `http://localhost:4001/workouts${queryString ? `?${queryString}` : ""}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok || !data.status) {
                throw new Error(data.message || "Could not fetch workouts.");
            }

            setWorkouts(data.workouts);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchWorkouts();
    }, [search, categoryFilter, difficultyFilter]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: name === "duration" ? Number(value) : value,
        }));
    };

    const handleEditWorkout = (workout) => {
        setEditingWorkoutId(workout._id);

        setFormData({
            name: workout.name,
            description: workout.description,
            category: workout.category,
            difficulty: workout.difficulty,
            duration: workout.duration,
        });

        setHours(String(Math.floor(workout.duration / 60)));
        setMinutes(String(workout.duration % 60));

        setError("");
        setShowForm(true);
    };

    const handleCreateWorkout = async (e) => {
        e.preventDefault();

        const durationInMinutes =
            Number(hours) * 60 + Number(minutes);

        if (durationInMinutes < 1) {
            setError("Workout duration must be at least 1 minute.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const token = localStorage.getItem("token");
            const isEditing = Boolean(editingWorkoutId);

            const response = await fetch(
                isEditing
                    ? `http://localhost:4001/workouts/${editingWorkoutId}`
                    : "http://localhost:4001/workouts",
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        ...formData,
                        duration: durationInMinutes,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.status) {
                throw new Error(
                    data.message || "Could not create workout"
                );
            }


            const savedWorkout = data.workout;

            if (!savedWorkout) {
                throw new Error(
                    "Workout saved, but the workout data was not returned."
                );
            }

            if (isEditing) {
                // Update the existing card instead of adding a new one
                setWorkouts((previous) =>
                    previous.map((workout) =>
                        workout._id === editingWorkoutId
                            ? savedWorkout
                            : workout
                    )
                );
            } else {
                // Add a new card only when creating a workout
                setWorkouts((previous) => [
                    savedWorkout,
                    ...previous,
                ]);
            }

            setEditingWorkoutId(null);


            setShowForm(false);

            setFormData({
                name: "",
                description: "",
                category: "Strength",
                difficulty: "Beginner",
                duration: 30,
            });

            setHours("0");
            setMinutes("30");




        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };
    const handleDeleteWorkout = async (workoutId) => {
        const result = await Swal.fire({
            title: "Delete this workout?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Keep workout",
            confirmButtonColor: "#ff5c5c",
            cancelButtonColor: "#444444",
            background: "#151515",
            color: "#ffffff",
            reverseButtons: true,
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:4001/workouts/${workoutId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok || !data.status) {
                throw new Error(
                    data.message || "Could not delete workout."
                );
            }

            // Remove the deleted workout from the UI
            setWorkouts((previous) =>
                previous.filter(
                    (workout) => workout._id !== workoutId
                )
            );

            await Swal.fire({
                title: "Workout Deleted!",
                text: "Your workout has been removed successfully.",
                icon: "success",
                confirmButtonColor: "#ff7a00",
                background: "#151515",
                color: "#ffffff",
            });

        } catch (error) {
            setError(error.message);

            await Swal.fire({
                title: "Deletion Failed",
                text: error.message,
                icon: "error",
                confirmButtonColor: "#ff7a00",
                background: "#151515",
                color: "#ffffff",
            });

        }
    };


    const handleCompleteWorkout = async (workoutId) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:4001/workouts/${workoutId}/complete`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok || !data.status) {
                throw new Error(data.message || "Failed to complete workout");
            }

            setWorkouts((previous) =>
                previous.map((workout) =>
                    workout._id === workoutId ? data.workout : workout
                )
            );

            Swal.fire({
                icon: "success",
                title: "Workout Completed!",
                text: "Great job! Keep pushing toward your fitness goals.",
                background: "#1a1a1a",
                color: "#ffffff",
                confirmButtonColor: "#ff6b00",
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text: error.message,
                background: "#1a1a1a",
                color: "#ffffff",
                confirmButtonColor: "#ff6b00",
            });
        }
    };



    return (

        <main className="workouts-page">
            <header className="workouts-header">


                <div>
                    <p className="workouts-eyebrow">
                        YOUR TRAINING SPACE
                    </p>
                    <h1>My Workouts</h1>
                    <p>Every session brings you closer to your goals.</p>
                </div>

                <button
                    className="add-workout-btn"
                    onClick={() => {
                        setShowForm((previous) => !previous);
                        setEditingWorkoutId(null);
                        setError("");
                    }}
                >
                    {showForm ? "Cancel" : "+ Create Workout"}
                </button>
            </header>


            <div className="workout-filters">
                <input
                    type="text"
                    placeholder="Search workouts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="workout-search"
                />

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="workout-filter-select"
                >
                    <option value="">All Categories</option>
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Balance">Balance</option>
                    <option value="Yoga">Yoga</option>
                </select>

                <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="workout-filter-select"
                >
                    <option value="">All Difficulties</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>

                <button
                    type="button"
                    className="reset-filters-btn"
                    onClick={() => {
                        setSearch("");
                        setCategoryFilter("");
                        setDifficultyFilter("");
                    }}
                >
                    Reset Filters
                </button>
            </div>

            <p className="workout-results-count">
                Showing {workouts.length}{" "}
                {workouts.length === 1 ? "workout" : "workouts"}
            </p>


            {showForm && (
                <form
                    className="workout-form"
                    onSubmit={handleCreateWorkout}
                >
                    <h2>
                        {editingWorkoutId ? "Edit Workout" : "Create Workout"}
                    </h2>
                    <input
                        name="name"
                        placeholder="Workout name"
                        value={formData.name}
                        onChange={handleChange}
                        minLength={3}
                        required
                    />

                    <textarea
                        name="description"
                        placeholder="Describe your workout"
                        value={formData.description}
                        onChange={handleChange}
                        minLength={10}
                        required
                    />

                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        {["Strength", "Cardio", "Flexibility", "Balance", "Yoga"].map(
                            (category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            )
                        )}
                    </select>

                    <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                    >
                        {["Beginner", "Intermediate", "Advanced"].map(
                            (difficulty) => (
                                <option key={difficulty} value={difficulty}>
                                    {difficulty}
                                </option>
                            )
                        )}
                    </select>



                    <div className="duration-fields">
                        <label>
                            Hours
                            <select
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                            >
                                {[0, 1, 2, 3].map((hour) => (
                                    <option key={hour} value={hour}>
                                        {hour} {hour === 1 ? "hour" : "hours"}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Minutes
                            <select
                                value={minutes}
                                onChange={(e) => setMinutes(e.target.value)}
                            >
                                {[0, 15, 30, 45].map((minute) => (
                                    <option key={minute} value={minute}>
                                        {minute} minutes
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <p className="duration-preview">
                        Total duration: {Number(hours) * 60 + Number(minutes)} minutes
                    </p>
                    <button type="submit" disabled={saving}>
                        {saving
                            ? "Saving..."
                            : editingWorkoutId
                                ? "Update Workout"
                                : "Save Workout"}
                    </button>
                </form>
            )}






            <section className="workouts-list">
                {loading ? (
                    <div className="workout-message">
                        <p>Loading your workouts...</p>
                    </div>
                ) : error ? (
                    <p className="workouts-error">{error}</p>
                ) : workouts.length === 0 ? (
                    <div className="workout-empty-state">
                        <div className="empty-state-icon">🏋️</div>

                        <h3>No workouts found</h3>

                        <p>
                            {search || categoryFilter || difficultyFilter
                                ? "Try another search or reset your filters."
                                : "You haven't created any workouts yet. Start building your routine!"}
                        </p>

                        {(search || categoryFilter || difficultyFilter) && (
                            <button
                                type="button"
                                className="reset-filters-btn"
                                onClick={() => {
                                    setSearch("");
                                    setCategoryFilter("");
                                    setDifficultyFilter("");
                                }}
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="workouts-grid">
                        {workouts.map((workout) => (
                            <article
                                className="workout-card"
                                key={workout._id}
                            >
                                <div>
                                    <span className="workout-category">
                                        {workout.category}
                                    </span>

                                    <h2>{workout.name}</h2>
                                    <p>{workout.description}</p>
                                </div>

                                <div className="workout-details">
                                    <span>{workout.difficulty}</span>
                                    <span>{workout.duration} min</span>
                                </div>

                                <div className="workout-actions">

                                    <button
                                        type="button"
                                        className="complete-workout-btn"
                                        onClick={() => handleCompleteWorkout(workout._id)}
                                        disabled={workout.isCompleted}
                                    >
                                        {workout.isCompleted ? "✓ Completed" : "Complete Workout"}
                                    </button>

                                    <button
                                        className="edit-workout-btn"
                                        onClick={() => handleEditWorkout(workout)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="delete-workout-btn"
                                        onClick={() =>
                                            handleDeleteWorkout(workout._id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main >
    );


};

export default Workouts;
