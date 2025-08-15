const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Document Approval System API is running',
    timestamp: new Date().toISOString()
  });
});

// Test auth endpoint
app.post('/api/auth/test', (req, res) => {
  res.json({ 
    message: 'Auth endpoint working',
    body: req.body
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
});
