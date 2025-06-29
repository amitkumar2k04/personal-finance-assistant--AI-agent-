// import './App.css'

import React, { useState } from 'react';
import ChatBox from './components/ChatBox.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="max-w-4xl w-full p-5 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Personal Finance Assistant (AI-agent)
        </h1>
        <ChatBox />
      </div>
    </div>
  );
}

export default App;

