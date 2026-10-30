
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    return (
        <nav className="cf-navbar">
            <NavLink to="/dashboard" className="cf-logo">
                C-FIT
            </NavLink>

            <div className="cf-nav-links">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/workouts">Workouts</NavLink>
                <NavLink to="/coach">AI Coach</NavLink>
                <NavLink to="/progress">Progress</NavLink>
            </div>
        </nav>
    );
};

export default Navbar;
