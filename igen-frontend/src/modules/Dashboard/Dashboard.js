import React, { useEffect, useState } from 'react';
import API from '../../api/axios'; // your axios instance with interceptors

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/dashboard-stats/')
      .then(res => setStats(res.data))
      .catch(err => {
        console.error("Dashboard fetch error:", err);
        alert("Failed to load dashboard stats. Please try again.");
      });
  }, []);

  return (
    <div className='p-10'>
      <h1>Dashboard</h1>
      {stats ? (
        <pre>{JSON.stringify(stats, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
