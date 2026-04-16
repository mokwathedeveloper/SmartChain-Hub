const axios = require('axios');

const AI_AGENT_URL = process.env.AI_AGENT_URL || 'http://localhost:5000';

const aiService = {
  optimize: async (amount, priority = 'efficiency') => {
    const res = await axios.post(`${AI_AGENT_URL}/optimize`, { amount, priority });
    return res.data;
  },
  health: async () => {
    const res = await axios.get(`${AI_AGENT_URL}/health`);
    return res.data;
  },
};

module.exports = aiService;
