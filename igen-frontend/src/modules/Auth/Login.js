'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [user_id, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState(''); // success | error

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/users/token/', {
        user_id,
        password,
      });
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      setType('success');
      setMessage('Login successful! please Wait...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      setType('error');
      setMessage('Login failed: check your credentials');
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-gray-800 relative overflow-hidden">

      {/* ✅ Notification */}
 {message && (
  <div
    className={`absolute top-5 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-md transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}
  >
    {message}
  </div>
)}


      {/* ✅ Left Side Image */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-igen relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1.5 }}
          className="absolute w-[600px] h-[600px] bg-shadow rounded-full blur-[120px] animate-pulse"
        ></motion.div>

        {/* ✅ Logo Animation */}
        <motion.img
          src="/logo/igen.png"
          alt="Visual"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration:1.5  }}
          className="w-[600px] z-10"
        />
      </div>

      {/* ✅ Right Side Login Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 py-12">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-md w-full mx-auto"
        >
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-700">Hi</h2>
            {/* ✅ Emoji Shake */}
            <motion.span
              animate={{ rotate: [0, 20, -15, 10, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="text-3xl"
            >
              👋
            </motion.span>
            <h2 className="text-2xl font-bold text-gray-700">Welcome back</h2>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Login to access your dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              value={user_id}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-2 border rounded-lg focus:outline-purple-600"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-purple-600"
            />
            <div className="text-right text-sm text-indigo-600 hover:underline cursor-pointer">
              Forgotten password?
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}