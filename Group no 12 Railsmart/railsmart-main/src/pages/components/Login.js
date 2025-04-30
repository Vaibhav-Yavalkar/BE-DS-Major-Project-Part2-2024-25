import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      sessionStorage.setItem("token", data.token); // Store in sessionStorage
      onLogin();
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-4">🔒 Login to Access</h1>
        <p className="text-gray-600 text-center mb-8">Enter your credentials to continue.</p>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Username</label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 border rounded-lg w-full focus:ring focus:ring-blue-300"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border rounded-lg w-full focus:ring focus:ring-blue-300"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 rounded-lg w-full">
          Login
        </button>
      </form>
    </div>
  );
}
