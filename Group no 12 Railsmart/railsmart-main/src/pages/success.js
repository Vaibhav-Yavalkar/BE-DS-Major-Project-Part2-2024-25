import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Success() {
  const router = useRouter();
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, razorpay_payment_link_id } = router.query;
  const [status, setStatus] = useState('Verifying...');
  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    // Only verify if we haven't already and all parameters are present
    if (!hasVerified && 
        razorpay_payment_id && 
        razorpay_signature) {
      verifyPayment();
      setHasVerified(true);
    }
  }, [router.query]); // Depend on router.query instead of individual parameters

  const verifyPayment = async () => {
    try {
      const response = await axios.post(`${apiBaseUrl}/verify-payment`, {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        razorpay_payment_link_id
      });
      console.log(response, response.status);
      if (response.status === 200) {
        setStatus('Payment Success 🎉');
      } else {
        setStatus('Payment verification failed.');
      }
    } catch (error) {
      console.log(error);
      setStatus('Error verifying payment.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-900">{status}</h1>
        <button
          onClick={() => router.push('/show-ticket')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Go to Tickets
        </button>
      </div>
    </div>
  );
}