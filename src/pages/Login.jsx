import { useState } from "react";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/c-fit-logo.png"
import "./Login.css";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import API_URL from "../config/api.js";

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);


    const handleLogin = async (e) => {
        e.preventDefault();

        if (isLoading) return;

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Login Failed",
                    text: data.message
                });

                return;
            }

            localStorage.setItem("token", data.token);

            Swal.fire({
                icon: "success",
                title: "Login Successful!",
                text: "Your C-FIT account has been logged in successfully",
                confirmButtonText: "OK"
            }).then(() => {
                navigate("/dashboard");
            });

        } catch (error) {
            console.log(error);

            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text: "Unable to connect to the server. Please try again."
            });

        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-logo">
                    <img src={logo} alt="C-FIT Logo" />
                </div>

                <div className="login-heading">
                    <p className="login-label">
                        TRAIN • BUILD • BE BETTER
                    </p>

                    <h1>
                        Welcome <span>Back.</span>
                    </h1>

                    <p>
                        Sign in to continue your fitness journey
                        with C-FIT.
                    </p>
                </div>

                <form onSubmit={handleLogin}>

                    <div className="login-input">
                        <label>Email Address</label>

                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>


                    <div className="login-input">
                        <label>Password</label>

                        <div className="password-field">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword((previous) => !previous)}
                                aria-label={showPassword ? "Hide password" : "Show password"}

                            >
                                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                    </div>


                    <div className="forgot-password">
                        <Link to="/forgot-password">
                            Forgot password?
                        </Link>
                    </div>

                    {/* Turnstile goes here */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="login-spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            "Sign In →"
                        )}
                    </button>

                </form>

                <div className="login-divider">
                    <span>OR</span>
                </div>


                <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                        if (googleLoading) return;

                        setGoogleLoading(true);

                        try {
                            const response = await fetch(
                                `${API_URL}/auth/google`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        credential: credentialResponse.credential,
                                    }),
                                }
                            );

                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error(
                                    data.message || "Google login failed"
                                );
                            }

                            localStorage.setItem("token", data.token);
                            localStorage.setItem("user", JSON.stringify(data.user));

                            await Swal.fire({
                                icon: "success",
                                title: "Welcome to C-FIT!",
                                text: "Google login successful.",
                            });

                            navigate("/dashboard");

                        } catch (error) {
                            console.error("Google login error:", error);

                            Swal.fire({
                                icon: "error",
                                title: "Google Login Failed",
                                text: error.message || "Please try again.",
                            });

                        } finally {
                            setGoogleLoading(false);
                        }
                    }}
                    onError={() => {
                        setGoogleLoading(false);

                        Swal.fire({
                            icon: "error",
                            title: "Google Login Failed",
                            text: "Google sign-in was unsuccessful. Please try again.",
                        });
                    }}
                />

                {googleLoading && (
                    <div className="google-loading">
                        <span className="login-spinner"></span>
                        Verifying Google account...
                    </div>
                )}


                <p className="login-register">
                    Don't have an account?

                    <Link to="/register">
                        Create one
                    </Link>
                </p>

            </div>

            <div className="login-showcase">

                <div className="login-showcase-content">

                    <p>TRAIN • BUILD • BE BETTER</p>

                    <h2>
                        DISCIPLINE
                        <span>BUILDS RESULTS.</span>
                    </h2>

                    <p>
                        Your workouts. Your progress.
                        Your AI-powered fitness journey.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Login;