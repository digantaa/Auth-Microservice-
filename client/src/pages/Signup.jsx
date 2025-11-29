import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import api from "../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm your password"),
});

export default function Signup() {
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
      const res = await api.post("/auth/signup", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      alert("Signup successful! You can login now.");
      navigate("/login");
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Signup failed. Try again."
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
          Create an Account
        </h2>

        {/* SERVER ERROR */}
        {serverError && (
          <p className="text-red-600 text-center mb-3">{serverError}</p>
        )}

        {/* NAME */}
        <label className="block mb-1 font-medium">Name</label>
        <input
          type="text"
          {...register("name")}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 mb-2"
          placeholder="Enter your name"
        />
        <p className="text-red-600 text-sm mb-2">{errors.name?.message}</p>

        {/* EMAIL */}
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 mb-2"
          placeholder="Enter your email"
        />
        <p className="text-red-600 text-sm mb-2">{errors.email?.message}</p>

        {/* PASSWORD */}
        <label className="block mb-1 font-medium">Password</label>
        <input
          type="password"
          {...register("password")}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 mb-2"
          placeholder="Create a password"
        />
        <p className="text-red-600 text-sm mb-2">{errors.password?.message}</p>

        {/* CONFIRM PASSWORD */}
        <label className="block mb-1 font-medium">Confirm Password</label>
        <input
          type="password"
          {...register("confirmPassword")}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 mb-2"
          placeholder="Confirm your password"
        />
        <p className="text-red-600 text-sm mb-2">
          {errors.confirmPassword?.message}
        </p>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded text-white mt-4 ${
            isSubmitting ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Creating..." : "Signup"}
        </button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
