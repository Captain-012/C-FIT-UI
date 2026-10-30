import { Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import Workouts from "./pages/Workouts";
import Coach from "./pages/Coach";
import Progress from "./pages/Progress";
import DashboardLayout from "./components/DashboardLayout";
import Nutrition from "./pages/Nutrition";

function App() {
    return (
        <Routes>
            {/* Public pages */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected pages share one layout */}
            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/workouts" element={<Workouts />} />
                <Route path="/coach" element={<Coach />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/nutrition" element={<Nutrition/>}/>
            </Route>
        </Routes>
    );
}

export default App;
