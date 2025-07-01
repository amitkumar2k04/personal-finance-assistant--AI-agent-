import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { callAgent } from './agent.js';
const serverless = require('serverless-http')

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

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

module.exports = app
module.exports.handler = serverless(app)

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
