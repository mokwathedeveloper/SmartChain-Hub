const { supabase } = require('../config/supabaseConfig');
const aiService = require('../services/aiService');
const blockchainService = require('../services/blockchainService');
const axios = require('axios');
const crypto = require('crypto');

// 0G Storage integration via frontend API routes
const uploadToStorage = async (data) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const response = await axios.post(`${frontendUrl}/api/storage-upload`, { data }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    console.warn('0G Storage upload failed, using fallback:', error.message);
    return {
      rootHash: `0x${crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')}`,
      txHash: "",
      storageScanUrl: ""
    };
  }
};

exports.optimizeTransaction = async (req, res) => {
  const { amount, priority, userId } = req.body;
  
  if (!amount) {
    return res.status(400).json({ error: 'amount required' });
  }
  
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }
  
  try {
    // Get AI optimization
    const result = await aiService.optimize(amount, priority || 'efficiency');
    
    // Add metadata
    result.userId = userId;
    result.timestamp = Date.now();
    result.backend_processed = true;
    
    res.json(result);
  } catch (err) {
    console.error('Optimization failed:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }
  
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Get transactions failed:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createTransaction = async (req, res) => {
  const { userId, amount, optimizedFee, savings, route, teeVerified, teeProof } = req.body;
  
  if (!userId || !amount) {
    return res.status(400).json({ error: 'userId and amount required' });
  }
  
  try {
    // Upload transaction metadata to 0G Storage
    const storageData = {
      user_id: userId,
      amount: parseFloat(amount),
      fee: parseFloat(optimizedFee || 0),
      savings: parseFloat(savings || 0),
      route: route || 'Unknown',
      tee_verified: teeVerified || false,
      tee_proof: teeProof || '',
      timestamp: Date.now(),
      backend_processed: true
    };
    
    const storageResult = await uploadToStorage(storageData);
    
    // Generate transaction hash
    const txHash = storageResult.txHash ||
      `0x${crypto.randomBytes(32).toString('hex')}`;
    
    // Save to database
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        amount: parseFloat(amount),
        optimized_fee: parseFloat(optimizedFee || 0),
        savings: parseFloat(savings || 0),
        route: route || 'Backend Route',
        status: 'pending',
        tx_hash: txHash,
        storage_root: storageResult.rootHash,
        storage_scan_url: storageResult.storageScanUrl
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Database insert error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    // Add storage info to response
    const response = {
      ...data,
      storage_info: storageResult
    };
    
    res.status(201).json(response);
  } catch (err) {
    console.error('Create transaction failed:', err);
    res.status(500).json({ error: err.message });
  }
};

// New endpoint: Complete transaction flow (optimize + create)
exports.processTransaction = async (req, res) => {
  const { userId, amount, priority } = req.body;
  
  if (!userId || !amount) {
    return res.status(400).json({ error: 'userId and amount required' });
  }
  
  try {
    // Step 1: Optimize
    const optimization = await aiService.optimize(amount, priority || 'efficiency');
    
    // Step 2: Create transaction record
    const createReq = {
      body: {
        userId,
        amount,
        optimizedFee: optimization.fee,
        savings: optimization.savings,
        route: optimization.route,
        teeVerified: optimization.tee_verified,
        teeProof: optimization.tee_proof
      }
    };
    
    // Use internal create function
    const mockRes = {
      status: (code) => ({ json: (data) => ({ statusCode: code, data }) }),
      json: (data) => ({ statusCode: 200, data })
    };
    
    const createResult = await new Promise((resolve, reject) => {
      const res = {
        status: (code) => ({
          json: (data) => {
            if (code >= 400) reject(new Error(data.error));
            else resolve(data);
          }
        }),
        json: (data) => resolve(data)
      };
      exports.createTransaction(createReq, res);
    });
    
    res.json({
      optimization,
      transaction: createResult,
      message: 'Transaction processed successfully'
    });
    
  } catch (err) {
    console.error('Process transaction failed:', err);
    res.status(500).json({ error: err.message });
  }
};

// Health check for backend services
exports.healthCheck = async (req, res) => {
  try {
    const aiHealth = await aiService.health();
    const dbHealth = await supabase.from('profiles').select('count').limit(1);
    
    res.json({
      status: 'healthy',
      services: {
        ai_agent: aiHealth,
        database: dbHealth.error ? 'unhealthy' : 'healthy',
        ai_agent_url: aiService.getAgentUrl()
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Fine-tune TF model on real user transaction data from 0G Storage
exports.fineTuneModel = async (req, res) => {
  const { root_hashes, dry_run } = req.body;

  if (root_hashes !== undefined && !Array.isArray(root_hashes)) {
    return res.status(400).json({ error: 'root_hashes must be an array' });
  }

  // If no root_hashes provided, fetch recent storage roots from DB
  let hashes = root_hashes || [];
  if (!hashes.length) {
    const { data } = await supabase
      .from('transactions')
      .select('storage_root')
      .not('storage_root', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);
    hashes = (data || []).map(r => r.storage_root).filter(Boolean);
  }

  const result = await aiService.fineTune(hashes, dry_run || false);
  const status = result.ok ? 200 : 422;
  res.status(status).json(result);
};
