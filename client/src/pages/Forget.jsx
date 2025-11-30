import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import api from "../utils/axiosInstance";
import { Link } from "react-router-dom";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
});

export default function Forget() {
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
      const res = await api.post("/auth/forgetpassword", data);

      setServerMsg(res.data.message || "Reset link has been sent to your email.");
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
          Reset Password
        </h2>

        {/* SUCCESS MESSAGE */}
        {serverMsg && (
          <p className="text-green-600 text-center mb-3">{serverMsg}</p>
        )}

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <p className="text-red-600 text-center mb-3">{errorMsg}</p>
        )}

        {/* EMAIL FIELD */}
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 mb-2"
          placeholder="Enter your email"
        />
        <p className="text-red-600 text-sm mb-2">{errors.email?.message}</p>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded text-white mt-4 ${
            isSubmitting ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
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
