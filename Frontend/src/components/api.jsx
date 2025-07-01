import axios from 'axios';

const API_BASE_URL = '/api/finance';

export const sendMessageToAI = async (userMessage) => {
  try {
    const response = await axios.post(API_BASE_URL, { question: userMessage });
    return response.data.reply;
  } catch (error) {
    console.error('Error in API call', error);
    return 'Unable to reach the server, please check your internet connection.';
  }
};
