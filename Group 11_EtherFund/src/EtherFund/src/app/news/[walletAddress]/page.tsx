"use client";

import { useState, useEffect } from "react";

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/rss")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch news");
        return res.json();
      })
      .then((data) => {
        console.log("📌 API Response:", data);
        setNews(data);
      })
      .catch((err) => {
        console.error("❌ Error fetching news:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">Latest Crowdfunding News</h2>

      {loading && <p className="text-gray-500">Loading news...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {news.length > 0 ? (
        news.map((item, index) => (
          <div key={index} className="p-4 border rounded mb-4 flex flex-col md:flex-row items-center">
            {/* 🖼 Display Image */}
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="w-40 h-40 object-cover mr-4 rounded"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/150"; // Fallback image
                }}
              />
            ) : (
              <div className="w-40 h-40 bg-gray-300 flex items-center justify-center text-gray-500 rounded">
                No Image
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-sm text-gray-700">{item.contentSnippet || "No description available"}</p>
              <a href={item.link} className="text-blue-500 mt-2 inline-block" target="_blank" rel="noopener noreferrer">
                Read more
              </a>
            </div>
          </div>
        ))
      ) : (
        !loading && !error && <p className="text-gray-500">No news available at the moment.</p>
      )}
    </div>
  );
}