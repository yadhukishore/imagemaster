import Button from "../../assets/Button";
import InputGroup from "../InputGroup/InputGroup";
import { useState } from "react";
import axios from "../../axiosConfig";
import { useNavigate } from "react-router-dom";

function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState({
    emailError: "",
    phoneError: "",
    passwordError: "",
    commonError: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      let hasError = false;
      let errorObj = {
        emailError: "",
        phoneError: "",
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

      // Validate Phone Number
      if (!phone.trim()) {
        hasError = true;
        errorObj.phoneError = "Phone number is required.";
      } else if (!/^\d{10}$/.test(phone)) {
        hasError = true;
        errorObj.phoneError = "Please enter a valid phone number";
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

      await axios.post(`/register`, {
        email,
        phone,
        password,
      });

      navigate("/login");
    } catch (error: any) {
      const status = error.response ? error.response.status : null;
      const errorMessage: string = error.response.data.message;

      if (status === 409) {
        setError({
          ...error,
          commonError: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="w-3/4  bg-gradient-to-br from-gray-900 to-gray-800 p-10 rounded-lg shadow-lg text-center max-w-lg mx-auto mt-10">
      <h1 className="mb-8 text-3xl font-extrabold text-white">Create Account</h1>

      <InputGroup
        label={"Email"}
        type={"email"}
        value={email}
        onChange={(e: any) => setEmail(e.target.value)}
        placeholder={"Enter your email"}
        error={error.emailError}
      />
      <InputGroup
        label={"Phone"}
        type={"text"}
        value={phone}
        onChange={(e: any) => setPhone(e.target.value)}
        placeholder={"Enter your phone number"}
        error={error.phoneError}
      />
      <div className="relative">
        <InputGroup
          label={"Password"}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          placeholder={"Create a password"}
          error={error.passwordError}
        />
        <i
          className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} cursor-pointer text-gray-600 absolute top-9 right-5`}
          onClick={() => setShowPassword(!showPassword)}
        ></i>
      </div>
      <Button
        label={"SIGN UP"}
        onClick={handleSubmit}
        loading={loading}
        error={error.commonError}
        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded w-full mt-5"
      />
      <span className="block mt-4 text-gray-100">
        Already have an account?{" "}
        <strong className="underline text-indigo-300 cursor-pointer" onClick={navigateToLogin}>
          Login here
        </strong>
      </span>
    </div>
  );
}

export default SignupForm;
