require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const seedAll = require('./seeds/seedData');

// Route imports
const authRoutes = require('./routes/authRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const membersRoutes = require('./routes/membersRoutes');
const mentorsRoutes = require('./routes/mentorsRoutes');
const meetingsRoutes = require('./routes/meetingsRoutes');
const reliabilityRoutes = require('./routes/reliabilityRoutes');
const exportsRoutes = require('./routes/exportsRoutes');
const guidesRoutes = require('./routes/guidesRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'SLIIT Gavel Club VPE Tool API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/mentors', mentorsRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/reliability', reliabilityRoutes);
app.use('/api/exports', exportsRoutes);
app.use('/api/guides', guidesRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Initialize DB and Start Server
async function startServer() {
  await connectDB();

  // Check if database needs initial seeding
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('[Init] Database is empty. Running initial auto-seed...');
    try {
      await seedAll();
    } catch (e) {
      console.error('[Init] Auto-seed warning:', e);
    }
  }

  app.listen(PORT, () => {
    console.log(`✨ SLIIT Gavel VPE Server running happily on http://localhost:${PORT}`);
  });
}

startServer();

module.exports = app;
