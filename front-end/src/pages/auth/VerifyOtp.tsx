import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp } from "../../api/auth.api";
import type { VerifyOtpPayload } from "../../types/auth.types";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = (location.state as { email?: string })?.email;

  const [formData, setFormData] = useState<VerifyOtpPayload>({
    email: emailFromState || "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user directly opens verify-otp page
  useEffect(() => {
    if (!emailFromState) {
      navigate("/register");
    }
  }, [emailFromState, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await verifyOtp(formData);

      // OTP verified → go to login
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center mb-4">
          Verify OTP
        </h2>

        <p className="text-sm text-gray-600 text-center mb-6">
          Enter the OTP sent to <b>{formData.email}</b>
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={formData.otp}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
