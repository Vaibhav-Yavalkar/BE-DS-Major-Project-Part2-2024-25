import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Check payment status from private environment variable
    const paymentStatus = process.env.PAYMENT_STATUS || "PENDING";
    
    if (paymentStatus !== "CLEARED") {
      return res.status(403).json({ error: "Payment Required" });
    }
    
    return res.status(200).json({ message: "Payment Cleared" });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
