import { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

function Dashboard() {
  const [data, setData] = useState({ tickets: [], challans: [] });

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Data:", data);
        setData(data);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const aggregateData = (data, key) => {
    if (!data || !Array.isArray(data)) return [];
    const counts = data.reduce((acc, item) => {
      const value = item[key] || "Unknown";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const ticketSalesData = useMemo(() => {
    if (!data.tickets) return [];
    const salesByDate = data.tickets.reduce((acc, ticket) => {
      const date = ticket.created_at ? new Date(ticket.created_at).toISOString().split('T')[0] : "Unknown";
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(salesByDate).map(([date, sales]) => ({ date, sales }));
  }, [data.tickets]);

  const fineIssuanceData = useMemo(() => {
    if (!data.challans) return [];
    const finesByDate = data.challans.reduce((acc, fine) => {
      const date = fine.created_at ? new Date(fine.created_at).toISOString().split('T')[0] : "Unknown";
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(finesByDate).map(([date, fines]) => ({ date, fines }));
  }, [data.challans]);

  const commonStationsData = useMemo(() => aggregateData(data.tickets, 'from_station'), [data.tickets]);

  const fineRevenueByOffenseData = useMemo(() => {
    if (!data.challans) return [];
    const revenueByOffense = data.challans.reduce((acc, challan) => {
      const offense = challan.reason || "Unknown";
      const fineAmount = parseFloat(challan.fine_amount) || 0;
      acc[offense] = (acc[offense] || 0) + fineAmount;
      return acc;
    }, {});
    return Object.entries(revenueByOffense).map(([offense, revenue]) => ({ name: offense, value: revenue }));
  }, [data.challans]);

  const monochromeColors = ["#2563EB", "#1E40AF", "#1E3A8A", "#172554", "#0F172A"]; // Shades of blue (from Tailwind blue-600 and darker)

  const ChartCard = ({ title, emoji, data, dataKey, chartType }) => {
    console.log(`Rendering chart: ${title}`, data);

    return (
      <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">{emoji} {title}</h2>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            {chartType === "bar" && (
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="#555" />
                <YAxis stroke="#555" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill={monochromeColors[0]}>
                  {data.map((_, index) => (
                    <Cell key={`bar-${index}`} fill={monochromeColors[index % monochromeColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
            {chartType === "line" && (
              <LineChart data={data}>
                <XAxis dataKey="date" stroke="#555" />
                <YAxis stroke="#555" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={dataKey} stroke={monochromeColors[0]} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            )}
            {chartType === "pie" && (
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  label
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={monochromeColors[index % monochromeColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-4">📊 Ticketing & Fine Dashboard</h1>
      <p className="text-gray-600 text-center mb-8">Real-time insights into ticket sales, fines, and revenue.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Ticket Sales Over Time', emoji: '🎟️', data: ticketSalesData, dataKey: 'sales', chartType: 'line' },
          { title: 'Fine Issuance Over Time', emoji: '🚔', data: fineIssuanceData, dataKey: 'fines', chartType: 'line' },
          { title: 'Most Common Stations', emoji: '🚉', data: commonStationsData, dataKey: 'value', chartType: 'bar' },
          { title: 'Fine Revenue by Offense', emoji: '💰', data: fineRevenueByOffenseData, dataKey: 'value', chartType: 'bar' },
          { title: 'Ticket Type Distribution', emoji: '🎫', data: aggregateData(data.tickets, 'validity'), dataKey: 'value', chartType: 'pie' },
          { title: 'Payment Status Overview', emoji: '💳', data: aggregateData(data.tickets, 'payment_status'), dataKey: 'value', chartType: 'pie' },
          { title: 'Common Offenses', emoji: '⚠️', data: aggregateData(data.challans, 'reason'), dataKey: 'value', chartType: 'bar' },
          { title: 'Fine Collection Status', emoji: '📩', data: aggregateData(data.challans, 'payment_status'), dataKey: 'value', chartType: 'pie' },
        ].map((props, index) => (
          <ChartCard key={index} {...props} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
