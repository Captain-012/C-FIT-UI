import { useState } from "react";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile"
import logo from "../assets/c-fit-logo.png";
import "./Register.css"
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";




const Register = () => {
    const navigate = useNavigate();
    const [turnstileToken, setTurnstileToken] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        if (formData.password !== formData.confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "",
                text: "Password do not match."
            });
            return;
        };

        if (!turnstileToken) {
            Swal.fire({
                icon: "warning",
                title: "Verification Required",
                text: "Please verify that you are human."
            });
            return;
        }

        try {
            const response = await fetch('http://localhost:4001/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    turnstileToken
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log("Registration failed:", errorData);
                return;
            }

            const data = await response.json();
            console.log("User registered successfully:", data);

            Swal.fire({
                icon: "success",
                title: "Registration Successful!",
                text: "Your C-FIT account has been created.",
                confirmButtonText: 'OK'
            }).then(() => {
                navigate("/login")
            })

        } catch (error) {
            console.error("Error registering user:", error);
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
                    >
                        Create Account →
                    </button>

                </form>

                <div className="register-divider">
                    <span>OR</span>
                </div>

                <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                        console.log("Google Login Success:", credentialResponse);

                        try {
                            const response = await fetch(
                                "http://localhost:4001/auth/google",
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
                            console.log("Google backend response:", data);
                            if (data.token) {
                                localStorage.setItem("token", data.token);

                                navigate("/dashboard")

                            }

                        } catch (error) {
                            console.error("Google authentication error:", error);
                        }
                    }}
                    onError={() => {
                        console.log("Google login Failed");

                    }}


                />

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