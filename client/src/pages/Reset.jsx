import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/axiosInstance";

const schema = yup.object().shape({
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm your password"),
});

export default function Reset() {
  const { token } = useParams(); // Get token from URL
  const [serverMsg, setServerMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setServerMsg("");
    setErrorMsg("");

    try {
      const res = await api.post("/auth/resetpassword", {
        token,
        newPassword: data.newPassword,
      });

      setServerMsg(res.data.message || "Password reset successful!");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Something went wrong. Try again."
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
          Create New Password
        </h2>

        {/* SUCCESS MESSAGE */}
        {serverMsg && (
          <p className="text-green-600 text-center mb-3">{serverMsg}</p>
        )}

        {errorMsg && (
          <p className="text-red-600 text-center mb-3">{errorMsg}</p>
        )}

        {/* NEW PASSWORD */}
        <label className="block mb-1 font-medium">New Password</label>
        <input
          type="password"
          {...register("newPassword")}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 mb-2"
          placeholder="Enter new password"
        />
        <p className="text-red-600 text-sm mb-2">
          {errors.newPassword?.message}
        </p>

        <label className="block mb-1 font-medium">Confirm Password</label>
        <input
          type="password"
          {...register("confirmPassword")}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 mb-2"
          placeholder="Confirm new password"
        />
        <p className="text-red-600 text-sm mb-2">
          {errors.confirmPassword?.message}
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded text-white mt-4 ${
            isSubmitting ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>

        <p className="text-center text-sm mt-4">
          Back to{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
