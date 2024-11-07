import Button from "../../assets/Button";
import InputGroup from "../InputGroup/InputGroup";
import { useContext, useState } from "react";
import axios from "../../axiosConfig";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState({
    emailError: "",
    passwordError: "",
    commonError: "",
  });
  const { setUser }: any = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      let hasError = false;
      let errorObj = {
        emailError: "",
        passwordError: "",
        commonError: "",
      };

      // Validate Email
      if (!email.trim()) {
        hasError = true;
        errorObj.emailError = "Please enter your email address.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        hasError = true;
        errorObj.emailError = "Please enter a valid email address.";
      }

      // Validate Password
      if (!password) {
        hasError = true;
        errorObj.passwordError = "Please enter a password.";
      } else if (password.length < 6) {
        hasError = true;
        errorObj.passwordError = "Password must be at least 6 characters long.";
      }

      setError(errorObj);

      if (hasError) return;

      if (loading) return;

      setLoading(true);

      const { data } = await axios.post(`/login`, {
        email: email.trim(),
        password,
      });

      navigate("/");

      localStorage.setItem("token", data.token);

      setUser(data.userData);
    } catch (error: any) {
      const status = error.response ? error.response.status : null;
      const errorMessage: string = error.response.data.message;

      if (status === 401 || status === 404) {
        setError({
          ...error,
          commonError: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigate("/register");
  };

  const navigateToForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl shadow-2xl text-center">
      <h1 className="text-3xl font-bold mb-8 text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Welcome Back
      </h1>

      <div className="space-y-6">
        <InputGroup
          label="Email"
          type="email"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          placeholder="Enter your email"
          error={error.emailError}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
        />

        <div className="relative">
          <InputGroup
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            placeholder="Enter your password"
            error={error.passwordError}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
          />
          <button
            className="absolute top-9 right-4 text-gray-400 hover:text-gray-200 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={navigateToForgotPassword}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <div className="pt-2">
          <Button
            label="Sign In"
            onClick={handleSubmit}
            loading={loading}
            error={error.commonError}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
          />
        </div>

        <p className="text-gray-400 mt-6">
          Don't have an account?{" "}
          <button
            onClick={navigateToSignup}
            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;