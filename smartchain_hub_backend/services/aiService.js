const axios = require('axios');

// Use deployed AI agent URL or fallback to localhost
const AI_AGENT_URL = process.env.AI_AGENT_URL || process.env.NEXT_PUBLIC_AI_AGENT_URL || 'http://localhost:5000';

const aiService = {
  optimize: async (amount, priority = 'efficiency') => {
    try {
      const res = await axios.post(`${AI_AGENT_URL}/optimize`, { amount, priority }, {
        timeout: 30000, // 30 second timeout
        headers: { 'Content-Type': 'application/json' }
      });
      return res.data;
    } catch (error) {
      console.error('AI Service Error:', error.message);
      throw new Error(`AI optimization failed: ${error.message}`);
    }
  },
  
  health: async () => {
    try {
      const res = await axios.get(`${AI_AGENT_URL}/health`, { timeout: 10000 });
      return res.data;
    } catch (error) {
      console.error('AI Health Check Failed:', error.message);
      return { status: 'unhealthy', error: error.message };
    }
  },
  
  getAgentUrl: () => AI_AGENT_URL,
};

module.exports = aiService;
