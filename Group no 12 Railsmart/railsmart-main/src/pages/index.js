import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        🎟️ Welcome to Ticket Booking System
      </h1>
      <p className="text-gray-700 mb-6 text-center">
        Manage your tickets seamlessly with our system. Choose an option below.
      </p>

      <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
        <button
          onClick={() => router.push("/show-ticket")}
          className="flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-700 text-white py-3 px-5 rounded-lg shadow-md transition-all duration-300"
        >
          🎫 Show Tickets
        </button>

        <button
          onClick={() => router.push("/book-ticket")}
          className="flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-700 text-white py-3 px-5 rounded-lg shadow-md transition-all duration-300"
        >
          🛒 Book Ticket
        </button>

        <button
          onClick={() => router.push("/fine")}
          className="flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-700 text-white py-3 px-5 rounded-lg shadow-md transition-all duration-300"
        >
          💳 TC Dashboard
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-700 text-white py-3 px-5 rounded-lg shadow-md transition-all duration-300"
        >
          📊 Analytics
        </button>
      </div>
    </div>
  );
}
