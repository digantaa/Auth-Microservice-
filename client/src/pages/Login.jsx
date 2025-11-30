import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import api from "../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setServerError("");

    try {
      const res = await api.post("/auth/login", data);

      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      navigate("/dashboard");
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Login failed. Try again."
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white px-8 py-10 shadow-lg rounded-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          Login please
        </h2>

        {/* SERVER ERROR */}
        {serverError && (
          <p className="text-red-600 text-center mb-3">{serverError}</p>
        )}

        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 mb-2"
          placeholder="Enter your email"
        />
        <p className="text-red-600 text-sm mb-2">{errors.email?.message}</p>

        <label className="block mb-1 font-medium">Password</label>
        <input
          type="password"
          {...register("password")}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 mb-2"
          placeholder="Enter your password"
        />
        <p className="text-red-600 text-sm mb-2">{errors.password?.message}</p>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded text-white mt-4 ${
            isSubmitting ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <Link to="/" className="text-blue-600">
            Sign up
          </Link>
        </p>

        <p className="text-center text-sm mt-2">
          <Link to="/forget" className="text-blue-600">
            Forgot Password?
          </Link>
        </p>
      </form>
    </div>
  );
}
