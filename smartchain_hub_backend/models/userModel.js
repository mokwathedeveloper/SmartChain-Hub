const { supabase } = require('../config/supabaseConfig');

const UserModel = {
  findById: (id) => supabase.from('profiles').select('*').eq('id', id).single(),
  update: (id, data) => supabase.from('profiles').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id),
};

module.exports = UserModel;
