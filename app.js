import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { callAgent } from './agent.js';

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? 'https://personal-finance-assistant-ai-agent.vercel.app/' : 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON data from requests

app.get('/', (req, res) => {
  res.send('Server is running. Use POST /api/finance for queries');
});

app.post('/api/finance', async (req, res) => {
  const { question } = req.body; // get user ques

  try {
    // pass the ques to agent.js
    const reply = await callAgent(question);

    res.json({ reply });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Error processing request' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
