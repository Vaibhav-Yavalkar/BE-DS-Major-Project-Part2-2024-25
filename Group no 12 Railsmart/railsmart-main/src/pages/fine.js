import { useState, useEffect } from "react";
import Head from "next/head";
import FileUploader from "./components/FileUploader";
import Login from "./components/Login";

export default function Fine() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Ticket Parser</title>
        <meta name="description" content="Upload a ticket image and parse details using AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className="h-screen bg-gray-300 text-gray-900" style={{ padding: "20px" }}>
        {isAuthenticated ? <FileUploader /> : <Login onLogin={() => setIsAuthenticated(true)} />}
      </main>
    </>
  );
}
