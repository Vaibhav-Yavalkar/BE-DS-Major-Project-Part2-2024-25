import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const rzrpyid = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
// Example partial list of Mumbai Local Stations
const mumbaiStations = [
  // Western Line
  'Churchgate',
  'Marine Lines',
  'Charni Road',
  'Grant Road',
  'Mumbai Central',
  'Dadar',
  'Bandra',
  'Andheri',
  'Borivali',
  'Virar',
  // Central Line
  'CSMT',
  'Byculla',
  'Kurla',
  'Ghatkopar',
  'Thane',
  'Dombivli',
  'Kalyan',
  // Harbor Line
  'Wadala Road',
  'Chembur',
  'Vashi',
  'Nerul',
  'Panvel'
];

export default function BookTicketPage() {
  const router = useRouter();

  // Form States
  const [userId, setUserId] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [journeyDate, setJourneyDate] = useState('');
  const [classValue, setClassValue] = useState('Second Class');
  const [adultChildValue, setAdultChildValue] = useState('Adult');
  const [validity, setValidity] = useState('One-Way');

  // Auto-calculated fare (hidden field)
  const [fareValue, setFareValue] = useState(0);

  // UI feedback
  const [message, setMessage] = useState('');

  // 1) Simple function to calculate a "random-ish" fare
  const calculateFare = () => {
    const fromIndex = mumbaiStations.indexOf(fromStation);
    const toIndex = mumbaiStations.indexOf(toStation);

    if (fromIndex === -1 || toIndex === -1) return 0;

    const distanceFactor = Math.abs(toIndex - fromIndex) || 1;
    let baseFare = distanceFactor * 10; // e.g., 10 Rs per station difference

    // Class multiplier
    if (classValue === 'First Class') {
      baseFare *= 2;
    }

    // Child discount
    if (adultChildValue === 'Child') {
      baseFare *= 0.5;
    }

    // Return ticket discount
    if (validity === 'Return') {
      baseFare *= 1.8; // e.g., 1.8 instead of 2.0 for a small discount
    }

    return parseFloat(baseFare.toFixed(2));
  };

  // 2) useEffect to recalc fare whenever relevant fields change
  useEffect(() => {
    setFareValue(calculateFare());
  }, [fromStation, toStation, classValue, adultChildValue, validity]);

  // 3) Load the Razorpay checkout script
  async function loadRazorpayScript() {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // 4) Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Creating ticket, please wait...');

    try {
      if (!fareValue) {
        throw new Error('Fare is zero. Check stations or input.');
      }

      const response = await fetch(`${apiBaseUrl}/create-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          from_station: fromStation,
          to_station: toStation,
          journey_date: journeyDate,
          class_value: classValue,
          fare_value: parseFloat(fareValue),
          adult_child_value: adultChildValue,
          validity: validity
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create ticket');
      }

      const data = await response.json();
      const { order_id, amount, currency } = data;

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        throw new Error('Razorpay SDK failed to load. Check your connection.');
      }

      // Initialize Razorpay payment
      const options = {
        key: rzrpyid, // Replace with your actual Razorpay Key ID or fetch from backend
        amount: amount * 100,   // amount in paise if not already
        currency: currency,
        name: 'Mumbai Local Tickets',
        description: 'Test Transaction',
        order_id: order_id,
        prefill: {
          // Autofill the user's phone number
          contact: userId
        },
        handler: (response) => {
          setMessage(`Payment Success! Payment ID: ${response.razorpay_payment_id}`);
          
          // Redirect to success page with payment details
          router.push({
            pathname: '/success',
            query: {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: order_id,
              razorpay_signature: response.razorpay_signature
            }
          });
        },
        theme: { color: '#0080ff' }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setMessage(error.message || 'Something went wrong');
    }
  };

  return (
    <>
      <Head>
        <title>Mumbai Local Ticket Booking</title>
        <meta name="description" content="Book Mumbai local tickets with ease" />
      </Head>
  
      <main className="bg-gray-300 min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto my-10 bg-white shadow-lg rounded-lg p-6 text-black">
          <h1 className="text-2xl font-bold text-center text-blue-700 mb-4">
            🚆 Mumbai Local Ticket Booking
          </h1>
  
          {message && (
            <div className="p-3 mb-4 text-sm rounded bg-blue-100 text-blue-800">
              {message}
            </div>
          )}
  
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Number */}
            <div>
              <label htmlFor="userId" className="block text-sm font-medium mb-1">
                📱 Phone Number
              </label>
              <input
                type="text"
                id="userId"
                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
  
            {/* From Station */}
            <div>
              <label htmlFor="fromStation" className="block text-sm font-medium mb-1">
                🚉 From Station
              </label>
              <select
                id="fromStation"
                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                value={fromStation}
                onChange={(e) => setFromStation(e.target.value)}
                required
              >
                <option value="">-- Select Station --</option>
                {mumbaiStations.map((station) => (
                  <option key={station} value={station}>
                    {station}
                  </option>
                ))}
              </select>
            </div>
  
            {/* To Station */}
            <div>
              <label htmlFor="toStation" className="block text-sm font-medium mb-1">
                🚉 To Station
              </label>
              <select
                id="toStation"
                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                value={toStation}
                onChange={(e) => setToStation(e.target.value)}
                required
              >
                <option value="">-- Select Station --</option>
                {mumbaiStations.map((station) => (
                  <option key={station} value={station}>
                    {station}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Journey Date */}
            <div>
              <label htmlFor="journeyDate" className="block text-sm font-medium mb-1">
                📅 Journey Date
              </label>
              <input
                type="date"
                id="journeyDate"
                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                required
              />
            </div>
  
            {/* Class */}
            <div>
              <label htmlFor="classValue" className="block text-sm font-medium mb-1">
                🏷️ Class
              </label>
              <select
                id="classValue"
                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                value={classValue}
                onChange={(e) => setClassValue(e.target.value)}
              >
                <option value="Second Class">Second Class</option>
                <option value="First Class">First Class</option>
              </select>
            </div>
  
            {/* Passenger Type */}
            <div>
              <label htmlFor="adultChildValue" className="block text-sm font-medium mb-1">
                👤 Passenger Type
              </label>
              <select
                id="adultChildValue"
                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                value={adultChildValue}
                onChange={(e) => setAdultChildValue(e.target.value)}
              >
                <option value="Adult">Adult</option>
                <option value="Child">Child</option>
              </select>
            </div>
  
            {/* Ticket Validity */}
            <div>
              <label htmlFor="validity" className="block text-sm font-medium mb-1">
                ⏳ Ticket Validity
              </label>
              <select
                id="validity"
                className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
              >
                <option value="One-Way">One-Way</option>
                <option value="Return">Return</option>
              </select>
            </div>
  
            {/* Hidden Fare Field */}
            <input type="hidden" id="fareValue" value={fareValue} readOnly />
  
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              💳 Book and Pay
            </button>
          </form>
        </div>
      </main>
    </>
  );  
}
