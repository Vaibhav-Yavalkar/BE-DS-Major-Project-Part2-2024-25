import { useState, useEffect } from "react";
import axios from "axios";

// Station coordinates mapping
const stationCoordinates = {
  // Western Line
  'Churchgate': { lat: 18.9322, lng: 72.8264 },
  'Marine Lines': { lat: 18.9430, lng: 72.8253 },
  'Charni Road': { lat: 18.9520, lng: 72.8230 },
  'Grant Road': { lat: 18.9633, lng: 72.8142 },
  'Mumbai Central': { lat: 18.9689, lng: 72.8183 },
  'Dadar': { lat: 19.0178, lng: 72.8478 },
  'Bandra': { lat: 19.0542, lng: 72.8386 },
  'Andheri': { lat: 19.1197, lng: 72.8464 },
  'Borivali': { lat: 19.2317, lng: 72.8567 },
  'Virar': { lat: 19.4565, lng: 72.7925 },
  // Central Line
  'CSMT': { lat: 18.9398, lng: 72.8354 },
  'Byculla': { lat: 18.9748, lng: 72.8332 },
  'Kurla': { lat: 19.0726, lng: 72.8845 },
  'Ghatkopar': { lat: 19.0858, lng: 72.9089 },
  'Thane': { lat: 19.1815, lng: 72.9750 },
  'Dombivli': { lat: 19.2187, lng: 73.0829 },
  'Kalyan': { lat: 19.2362, lng: 73.1304 },
  // Harbor Line
  'Wadala Road': { lat: 19.0182, lng: 72.8625 },
  'Chembur': { lat: 19.0522, lng: 72.8994 },
  'Vashi': { lat: 19.0759, lng: 72.9988 },
  'Nerul': { lat: 19.0348, lng: 73.0155 },
  'Panvel': { lat: 18.9921, lng: 73.1175 }
};

// Ticket Validation Component
const TicketValidation = ({ ticketData }) => {
  const [locationWarning, setLocationWarning] = useState('');
  const [validityWarning, setValidityWarning] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);

  // Check if ticket is expired
  const checkValidity = (ticketData) => {
    if (!ticketData || !ticketData['Date of Issue'] || !ticketData.Validity) return;

    const issueDate = new Date(ticketData['Date of Issue']);
    const currentDate = new Date();
    
    // Add hours based on ticket type
    const validityHours = ticketData.Validity.toLowerCase().includes('return') ? 48 : 24;
    const expiryDate = new Date(issueDate.getTime() + validityHours * 60 * 60 * 1000);

    if (currentDate > expiryDate) {
      setValidityWarning(`Ticket expired! Valid until: ${expiryDate.toLocaleString()}`);
    } else {
      setValidityWarning('');
    }
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Check if current location is within bounds
  const checkLocation = async (ticketData) => {
    if (!ticketData || !ticketData['From Station'] || !ticketData['To Station']) return;

    try {
      // Get current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });

      const fromStation = stationCoordinates[ticketData['From Station']];
      const toStation = stationCoordinates[ticketData['To Station']];

      if (!fromStation || !toStation) {
        setLocationWarning('Station coordinates not found');
        return;
      }

      const distanceFromSource = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        fromStation.lat,
        fromStation.lng
      );

      const distanceFromDestination = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        toStation.lat,
        toStation.lng
      );

      const minDistance = Math.min(distanceFromSource, distanceFromDestination);

      if (minDistance > 500) {
        setLocationWarning(`Warning: Current location is ${Math.round(minDistance)}m away from nearest valid station`);
      } else {
        setLocationWarning('');
      }
    } catch (error) {
      setLocationWarning('Unable to verify location. Please enable location services.');
    }
  };

  useEffect(() => {
    if (ticketData) {
      checkValidity(ticketData);
      checkLocation(ticketData);
    }
  }, [ticketData]);

  if (!ticketData) return null;

  return (
    <div className="mt-4 space-y-2">
      {validityWarning && (
        <div className="p-3 bg-red-100 border border-red-400 rounded-md text-red-700">
          <span className="font-semibold">⚠️ Validity Warning:</span> {validityWarning}
        </div>
      )}
      {locationWarning && (
        <div className="p-3 bg-orange-100 border border-orange-400 rounded-md text-orange-700">
          <span className="font-semibold">⚠️ Location Warning:</span> {locationWarning}
        </div>
      )}
    </div>
  );
};

// Challan Modal Component
const ChallanModal = ({ show, onClose, onSubmit, initialData, isIssuing }) => {
  const [localDetails, setLocalDetails] = useState(initialData);

  useEffect(() => {
    setLocalDetails(initialData);
  }, [initialData]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(localDetails);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Issue Challan</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number (User ID)
            </label>
            <input
              type="text"
              value={localDetails.user_id}
              onChange={(e) => setLocalDetails({
                ...localDetails,
                user_id: e.target.value
              })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Reason
            </label>
            <input
              type="text"
              value={localDetails.reason}
              onChange={(e) => setLocalDetails({
                ...localDetails,
                reason: e.target.value
              })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Fine Amount (₹)
            </label>
            <input
              type="number"
              value={localDetails.fine_amount}
              onChange={(e) => setLocalDetails({
                ...localDetails,
                fine_amount: parseFloat(e.target.value)
              })}
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isIssuing}
              className={`px-4 py-2 text-white rounded ${
                isIssuing
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isIssuing ? "Issuing..." : "Issue Challan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main FileUploader Component
export default function FileUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [checkingServer, setCheckingServer] = useState(true);
  const [issuingChallan, setIssuingChallan] = useState(false);
  const [challanMessage, setChallanMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [challanDetails, setChallanDetails] = useState({
    user_id: "",
    reason: "Invalid ticket",
    fine_amount: 500.00
  });

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const whatsappApiUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_URL;

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const result = await axios.get(`${apiBaseUrl}/status`);
        if (result.status === 200) {
          setServerReady(true);
        } else {
          setServerReady(false);
        }
      } catch {
        setServerReady(false);
      } finally {
        setCheckingServer(false);
      }
    };

    checkServerStatus();
  }, [apiBaseUrl]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setResponse(null);
    setError(null);
    setChallanMessage("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setLoading(true);
    setError(null);

    try {
      const result = await axios.post(`${apiBaseUrl}/parse-ticket`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResponse(result.data);
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred while processing the file.");
    } finally {
      setLoading(false);
    }
  };

  const openChallanModal = () => {
    setChallanDetails({
      ...challanDetails,
      user_id: response?.phone_number || response?.userId || "",
    });
    setShowModal(true);
  };

  const handleChallanSubmit = async (details) => {
    if (!response) return;

    try {
      setIssuingChallan(true);
      setChallanMessage("Issuing challan...");

      const challanResponse = await axios.post(`${apiBaseUrl}/issue-challan`, {
        ...details,
        ticket_id: response.ticket_id || response.id,
      });

      if (challanResponse.data.payment_link) {
        try {
          const phoneNumber = details.user_id.replace(/\D/g, ""); // Ensure only digits
          const paymentMessage = encodeURIComponent(
            `Please pay your challan using this link: ${challanResponse.data.payment_link}\nAmount: ₹${challanResponse.data.amount}`
          );
        
          const waLink = `https://wa.me/${phoneNumber}?text=${paymentMessage}`;
        
          window.open(waLink, "_blank");
        
          setChallanMessage("Challan issued and payment link sent via WhatsApp!");
        }
        catch (error) {
          console.error("WhatsApp API Error:", error);
          setChallanMessage("Challan issued but couldn't send WhatsApp message. Payment link: " + challanResponse.data.payment_link);
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setChallanMessage(
        `Failed to issue challan: ${error.response?.data?.detail || error.message}`
      );
    } finally {
      setIssuingChallan(false);
    }
  };
return (
  <div className="max-w-md mx-auto text-center p-6 bg-white shadow-lg rounded-lg">
    <h1 className="text-2xl font-bold text-blue-600 mb-4">📤 Upload Ticket Image</h1>
    
    {checkingServer ? (
      <p className="text-gray-500">Checking server status...</p>
    ) : serverReady ? (
      <>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm cursor-pointer mb-4 border rounded-lg p-2 border-gray-300"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`w-full px-4 py-2 text-white font-semibold rounded-lg transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "📤 Upload"}
        </button>
      </>
    ) : (
      <p className="text-red-500">❌ Server is not available. Please try again later.</p>
    )}

    {error && <p className="text-red-500 mt-4">{error}</p>}

    {response && (
      <div className="mt-8 text-left">
        <h3 className="text-lg font-semibold text-blue-600 mb-2">📄 Ticket Data:</h3>
        <pre className="p-4 border-2 border-dashed border-gray-400 shadow-md bg-gray-50 rounded-lg text-sm mb-4 overflow-x-auto">
          {JSON.stringify(response, null, 2)}
        </pre>

        <TicketValidation ticketData={response} />

        <div className="text-center mt-4">
          <button
            onClick={openChallanModal}
            disabled={issuingChallan}
            className={`w-full px-6 py-2 text-white font-semibold rounded-lg transition ${
              issuingChallan 
                ? "bg-red-400 cursor-not-allowed" 
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {issuingChallan ? "⏳ Issuing..." : "🚔 Issue Challan"}
          </button>

          {challanMessage && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              challanMessage.includes("Failed") 
                ? "bg-red-100 text-red-700" 
                : "bg-green-100 text-green-700"
            }`}>
              {challanMessage}
            </div>
          )}
        </div>
      </div>
    )}

    <ChallanModal
      show={showModal}
      onClose={() => setShowModal(false)}
      onSubmit={handleChallanSubmit}
      initialData={challanDetails}
      isIssuing={issuingChallan}
    />
  </div>
);
}