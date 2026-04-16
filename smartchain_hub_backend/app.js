const express = require('express');
const cors = require('cors');
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'SmartChain Hub Backend' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

module.exports = app;
