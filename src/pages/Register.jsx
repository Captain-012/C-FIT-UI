import { useState } from "react";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile"
import logo from "../assets/c-fit-logo.png";
import "./Register.css"
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";
import API_URL from "../config/api.js";




const Register = () => {
    const navigate = useNavigate();
    const [turnstileToken, setTurnstileToken] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (isLoading) return;

        if (formData.password !== formData.confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "Password Mismatch",
                text: "Your passwords do not match."
            });
            return;
        }

        if (!turnstileToken) {
            Swal.fire({
                icon: "warning",
                title: "Verification Required",
                text: "Please verify that you are human."
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    turnstileToken
                })
            });

            const data = await response.json();

            if (!response.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Registration Failed",
                    text: data.message || "Unable to create your account. Please try again."
                });
                return;
            }

            await Swal.fire({
                icon: "success",
                title: "Registration Successful!",
                text: "Your C-FIT account has been created.",
                confirmButtonText: "OK"
            });

            navigate("/login");

        } catch (error) {
            console.error("Error registering user:", error);

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
        <div className="register-page">

            <div className="register-card">

                <div className="register-logo">
                    <img src={logo} alt="C-FIT Logo" />
                </div>

                <div className="register-heading">
                    <p className="register-label">
                        TRAIN • BUILD • BE BETTER
                    </p>

                    <h1>
                        Create Your <span>Account</span>
                    </h1>

                    <p>
                        Join C-FIT and start your AI-powered fitness journey.
                    </p>
                </div>

                <form onSubmit={handleRegister}>

                    <div className="register-input">
                        <label>Full Name</label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="register-input">
                        <label>Email Address</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>


                    <div className="register-input">
                        <label>Password</label>

                        <div className="password-field">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
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



                    <div className="register-input">
                        <label>Confirm Password</label>

                        <div className="password-field">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword((previous) => !previous)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                    </div>


                    {/* Turnstile will go here */}
                    <Turnstile
                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                        onSuccess={(token) => {
                            console.log("Turnstile success:", token);
                            setTurnstileToken(token);
                        }}
                    />

                    <button
                        type="submit"
                        className="register-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="register-spinner"></span>
                                Creating account...
                            </>
                        ) : (
                            "Create Account →"
                        )}
                    </button>

                </form>

                <div className="register-divider">
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
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        credential: credentialResponse.credential
                                    })
                                }
                            );

                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error(
                                    data.message || "Google registration failed"
                                );
                            }

                            localStorage.setItem("token", data.token);
                            localStorage.setItem("user", JSON.stringify(data.user));

                            await Swal.fire({
                                icon: "success",
                                title: "Welcome to C-FIT!",
                                text: "Your Google account is ready."
                            });

                            navigate("/dashboard");

                        } catch (error) {
                            console.error("Google registration error:", error);

                            Swal.fire({
                                icon: "error",
                                title: "Google Registration Failed",
                                text: error.message || "Please try again."
                            });

                        } finally {
                            setGoogleLoading(false);
                        }
                    }}

                    onError={() => {
                        setGoogleLoading(false);

                        Swal.fire({
                            icon: "error",
                            title: "Google Sign-in Failed",
                            text: "Google authentication was unsuccessful. Please try again."
                        });
                    }}
                />

                {googleLoading && (
                    <div className="google-loading">
                        <span className="login-spinner"></span>
                        <span>Creating your C-FIT account...</span>
                    </div>
                )}


                <p className="register-login">
                    Already have an account?

                    <Link to="/login">
                        Sign in
                    </Link>
                </p>

            </div>

            <div className="register-showcase">

                <div className="showcase-content">

                    <p>TRAIN • BUILD • BE BETTER</p>

                    <h2>
                        YOUR JOURNEY
                        <span>STARTS HERE.</span>
                    </h2>

                    <p>
                        Build stronger habits, track your progress,
                        and train smarter with C-FIT.
                    </p>

                </div>

            </div>

        </div>
    );

};



export default Register;