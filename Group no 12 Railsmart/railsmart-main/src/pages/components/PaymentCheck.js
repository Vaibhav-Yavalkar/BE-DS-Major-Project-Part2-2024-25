import { useEffect, useState } from "react";

export default function PaymentCheck({ onAccessGranted }) {
  const [isPaid, setIsPaid] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkPayment() {
      try {
        const response = await fetch("/api/check-payment");
        if (response.ok) {
          setIsPaid(true);
          onAccessGranted();
        } else {
          setIsPaid(false);
          setError("Access Restricted: Your payment is pending. Please contact support.");
        }
      } catch (err) {
        setIsPaid(false);
        setError("Error: Unable to verify payment status. Try again later.");
      }
    }
    checkPayment();
  }, [onAccessGranted]);

  if (isPaid === null) {
    return <p className="text-center text-gray-600">Verifying payment status...</p>;
  }

  if (!isPaid) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center border border-red-500">
          <h1 className="text-2xl font-bold text-red-700 mb-4">⛔ Access Restricted</h1>
          <p className="text-gray-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return null;
}