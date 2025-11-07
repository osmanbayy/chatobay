import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import {
  EyeClosedIcon,
  EyeIcon,
  LockIcon,
  MailIcon,
  MessageCircleIcon,
  UserIcon,
} from "lucide-react";
import { LoaderIcon } from "react-hot-toast";
import { Link } from "react-router";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (event) => {
    event.preventDefault();
    signup(formData);
  };
  return (
    <div className="flex items-center justify-center w-full p-4">
      <div className="relative w-full max-w-6xl md:h-[800px] h-[650px]">
        <BorderAnimatedContainer>
          <div className="flex flex-col w-full md:flex-row">
            {/* Form Column - Left Side */}
            <div className="flex items-center justify-center p-8 md:w-1/2 md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                {/* Heading Text */}
                <div className="mb-8 text-center">
                  <MessageCircleIcon className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <h2 className="mb-2 text-2xl font-bold text-slate-200">
                    Create Account
                  </h2>
                  <p className="text-slate-400">Sign up for a new account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name Input */}
                  <div>
                    <label className="auth-input-label">Full Name</label>
                    <div className="relative">
                      <UserIcon className="auth-input-icon" />

                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="input"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  {/* Email Input */}
                  <div>
                    <label className="auth-input-label">Email</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />

                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="input"
                        placeholder="johndoe@gmail.com"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="auth-input-label">Password</label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />
                      {showPassword ? (
                        <EyeClosedIcon
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="show-password-icon"
                        />
                      ) : (
                        <EyeIcon
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="show-password-icon"
                        />
                      )}

                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="input"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    className="auth-btn"
                    type="submit"
                    disabled={isSigningUp}
                  >
                    {isSigningUp ? (
                      <LoaderIcon className="w-full h-5 text-center animate-spin" />
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="auth-link">
                    Already have an account?{" "}
                    <span className="underline">Login here.</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Form Illustration - Right Side */}
            <div className="items-center justify-center hidden p-6 md:w-1/2 md:flex bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/signup.png"
                  alt="People using mobile devices"
                  className="object-contain w-full h-auto"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">
                    Start Your Journey Today
                  </h3>

                  <div className="flex justify-center gap-4 mt-4">
                    <span className="auth-badge">Free</span>
                    <span className="auth-badge">Easy Setup</span>
                    <span className="auth-badge">Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
};

export default SignupPage;
