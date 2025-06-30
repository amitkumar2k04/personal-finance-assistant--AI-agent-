import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatBox = () => {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const chatContainerRef = useRef(null);

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (userInput.trim() === '') return;

    const newMessage = { text: userInput, sender: 'user' };
    setChatHistory([...chatHistory, newMessage]);
    setUserInput('');

    setLoading(true);

    try {
      const response = await axios.post('/api/finance', { question: userInput });
      const botReply = response.data.reply;
      setChatHistory([...chatHistory, newMessage, { text: botReply, sender: 'ai' }]);
    } catch (error) {
      console.error("Error while sending message:", error);
      setChatHistory([...chatHistory, newMessage, { text: "😕 Oops! Can’t reach the server. Please try again.", sender: 'ai' }]);
    }
    setLoading(false);
  };

  // Scroll to the bottom when chat history changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="flex flex-col">
      <div ref={chatContainerRef} className="overflow-y-auto p-4 mb-4 h-80 border rounded-lg bg-gray-50">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div
              className={`inline-block max-w-xs p-2 rounded-lg ${
                msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-center text-gray-600 mt-4">
            <span>processing...</span>
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
        <input
          type="text"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask something..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded-md disabled:bg-blue-400"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
