const { supabase } = require('../config/supabaseConfig');

exports.getProfile = async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return res.status(404).json({ error: 'Profile not found' });
  res.json(data);
};

exports.updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { full_name } = req.body;
  const { data, error } = await supabase.from('profiles').update({ full_name, updated_at: new Date().toISOString() }).eq('id', userId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
