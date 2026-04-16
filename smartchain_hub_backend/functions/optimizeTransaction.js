const aiService = require('../services/aiService');

/**
 * Serverless function: AI-driven transaction optimization.
 * Can be deployed as a Supabase Edge Function or AWS Lambda.
 */
module.exports = async (req, res) => {
  const { amount, priority = 'efficiency', userId } = req.body || {};
  if (!amount) return res.status(400).json({ error: 'amount is required' });

  try {
    const result = await aiService.optimize(parseFloat(amount), priority);
    res.json({ ...result, userId, timestamp: new Date().toISOString() });
  } catch (err) {
    // Fallback simulation if AI agent is offline
    const amt = parseFloat(amount);
    res.json({
      fee: (amt * 0.005).toFixed(2),
      savings: (amt * 0.015).toFixed(2),
      route: '0G Chain Flash Route',
      confidence: 87,
      ml_engine: 'Fallback Heuristic',
      explanation: `Optimized for ${priority} using fallback heuristics.`,
      tee_verified: false,
    });
  }
};
