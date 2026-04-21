const { supabase } = require('../config/supabaseConfig');

const TransactionModel = {
  findByUser: (userId) => supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  create: (data) => supabase.from('transactions').insert([data]).select().single(),
  updateStatus: (id, status) => supabase.from('transactions').update({ status }).eq('id', id),
};

module.exports = TransactionModel;
