import axios from 'axios';

const API_BASE_URL = import.meta.env.NODE_ENV === 'production'
  ? 'https://personal-finance-assistant-ai-agent-teal.vercel.app/api/finance'
  : 'http://localhost:8080/api/finance';

export const sendMessageToAI = async (userMessage) => {
  try {
    const response = await axios.post(API_BASE_URL, { question: userMessage });
    return response.data.reply;
  } catch (error) {
    console.error('Error in API call', error);
    return 'Sorry, there was an error processing your request.';
  }
};



// import axios from 'axios';

// const API_BASE_URL = '/api/finance';

// export const sendMessageToAI = async (userMessage) => {
//   try {
//     const response = await axios.post(API_BASE_URL, { question: userMessage });
//     return response.data.reply;
//   } catch (error) {
//     console.error('Error in API call', error);
//     return 'Sorry, there was an error processing your request.';
//   }
// };
