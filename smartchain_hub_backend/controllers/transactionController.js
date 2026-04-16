const { supabase } = require('../config/supabaseConfig');
const aiService = require('../services/aiService');
const blockchainService = require('../services/blockchainService');

exports.optimizeTransaction = async (req, res) => {
  const { amount, priority, userId } = req.body;
  if (!amount) return res.status(400).json({ error: 'amount required' });
  try {
    const result = await aiService.optimize(amount, priority);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.createTransaction = async (req, res) => {
  const { userId, amount, optimizedFee, savings, route } = req.body;
  const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2, 10)}`;
  const { data, error } = await supabase.from('transactions').insert([{
    user_id: userId, amount, optimized_fee: optimizedFee,
    savings, route, status: 'pending', tx_hash: txHash
  }]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
