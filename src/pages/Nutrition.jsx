
import { useState } from "react";
import "./Nutrition.css";

const Nutrition = () => {
    const [meals, setMeals] = useState([]);

    const [mealName, setMealName] = useState("");
    const [mealType, setMealType] = useState("Breakfast");
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fats, setFats] = useState("");

    const dailyCalorieGoal = 2000;

    const totalCalories = meals.reduce(
        (total, meal) => total + meal.calories,
        0
    );

    const totalProtein = meals.reduce(
        (total, meal) => total + meal.protein,
        0
    );

    const totalCarbs = meals.reduce(
        (total, meal) => total + meal.carbs,
        0
    );

    const totalFats = meals.reduce(
        (total, meal) => total + meal.fats,
        0
    );

    const addMeal = (e) => {
        e.preventDefault();

        if (!mealName.trim() || calories === "") {
            return;
        }

        const newMeal = {
            id: Date.now(),
            name: mealName.trim(),
            type: mealType,
            calories: Number(calories),
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fats: Number(fats) || 0,
        };

        setMeals((previousMeals) => [
            ...previousMeals,
            newMeal,
        ]);

        setMealName("");
        setCalories("");
        setProtein("");
        setCarbs("");
        setFats("");
    };

    const removeMeal = (mealId) => {
        setMeals((previousMeals) =>
            previousMeals.filter((meal) => meal.id !== mealId)
        );
    };

    return (
        <div className="nutrition-page">
            <header className="nutrition-header">
                <div>
                    <h1>Nutrition</h1>
                    <p>
                        Track your meals and fuel your fitness goals.
                    </p>
                </div>
            </header>

            <section className="nutrition-stats">
                <div className="nutrition-card">
                    <h3>Calories</h3>
                    <h2>{totalCalories} kcal</h2>
                    <p>Goal: {dailyCalorieGoal} kcal</p>
                    <div className="nutrition-progress">
                        <div
                            style={{
                                width: `${Math.min(
                                    (totalCalories / dailyCalorieGoal) * 100,
                                    100
                                )}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="nutrition-card">
                    <h3>Protein</h3>
                    <h2>{totalProtein} g</h2>
                    <p>Daily total</p>
                </div>

                <div className="nutrition-card">
                    <h3>Carbohydrates</h3>
                    <h2>{totalCarbs} g</h2>
                    <p>Daily total</p>
                </div>

                <div className="nutrition-card">
                    <h3>Fats</h3>
                    <h2>{totalFats} g</h2>
                    <p>Daily total</p>
                </div>
            </section>

            <section className="nutrition-section">
                <h2>Add a Meal</h2>

                <form onSubmit={addMeal} className="meal-form">
                    <label>
                        Food name
                        <input
                            value={mealName}
                            onChange={(e) => setMealName(e.target.value)}
                            placeholder="e.g. Rice and chicken"
                            required
                        />
                    </label>

                    <label>
                        Meal type
                        <select
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value)}
                        >
                            <option>Breakfast</option>
                            <option>Lunch</option>
                            <option>Dinner</option>
                            <option>Snack</option>
                        </select>
                    </label>

                    <label>
                        Calories (kcal)
                        <input
                            type="number"
                            min="0"
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Protein (g)
                        <input
                            type="number"
                            min="0"
                            value={protein}
                            onChange={(e) => setProtein(e.target.value)}
                        />
                    </label>

                    <label>
                        Carbohydrates (g)
                        <input
                            type="number"
                            min="0"
                            value={carbs}
                            onChange={(e) => setCarbs(e.target.value)}
                        />
                    </label>

                    <label>
                        Fats (g)
                        <input
                            type="number"
                            min="0"
                            value={fats}
                            onChange={(e) => setFats(e.target.value)}
                        />
                    </label>

                    <button type="submit">Add Meal</button>
                </form>
            </section>

            <section className="nutrition-section">
                <h2>Today's Meals</h2>

                {meals.length === 0 ? (
                    <p className="empty-meals">
                        No meals recorded yet. Add your first meal above.
                    </p>
                ) : (
                    <div className="meal-list">
                        {meals.map((meal) => (
                            <article className="meal-item" key={meal.id}>
                                <div>
                                    <h3>{meal.name}</h3>
                                    <p>
                                        {meal.type} · {meal.calories} kcal
                                    </p>
                                    <small>
                                        Protein: {meal.protein} g · Carbs:{" "}
                                        {meal.carbs} g · Fats: {meal.fats} g
                                    </small>
                                </div>

                                <button
                                    type="button"
                                    className="remove-meal"
                                    onClick={() => removeMeal(meal.id)}
                                >
                                    Remove
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Nutrition;
