
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/c-fit-logo.png";
import "./DashboardLayout.css";
import Swal from "sweetalert2";

const DashboardLayout = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);


    const handleLogout = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out of your C-FIT account.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ff6b00",
            cancelButtonColor: "#555555",
            confirmButtonText: "Yes, log me out",
            cancelButtonText: "Cancel",
            background: "#111111",
            color: "#ffffff",
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                closeMenu();
                navigate("/login", { replace: true });
            }
        });
    };


    return (
        <div className="dashboard-layout">
            <header className="mobile-header">
                <img src={logo} alt="C-FIT Logo" />

                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={() => setMenuOpen((previous) => !previous)}
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    aria-controls="cfit-sidebar"
                >
                    {menuOpen ? "✕" : "☰"}
                </button>
            </header>

            {menuOpen && (
                <button
                    type="button"
                    className="mobile-overlay"
                    aria-label="Close navigation menu"
                    onClick={closeMenu}
                />
            )}

            <aside
                id="cfit-sidebar"
                className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}
            >
                <div className="sidebar-logo">
                    <img src={logo} alt="C-FIT Logo" />
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" onClick={closeMenu}>
                        Dashboard
                    </NavLink>

                    <NavLink to="/workouts" onClick={closeMenu}>
                        Workouts
                    </NavLink>

                    <NavLink to="/coach" onClick={closeMenu}>
                        AI Coach
                    </NavLink>

                    <NavLink to="/progress" onClick={closeMenu}>
                        Progress
                    </NavLink>

                    <NavLink to="/nutrition" onClick={closeMenu}>
                        Nutrition
                    </NavLink>


                </nav>

                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </aside>

            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
