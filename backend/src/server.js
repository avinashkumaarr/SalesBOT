require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const productRoutes = require('./routes/productRoutes');
const miscRoutes = require('./routes/miscRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Dynamically accept any origin (Vercel, Render, localhost, Mobile APK, etc.) with credentials enabled
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate Limiting
app.use('/api', generalLimiter);

// Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AI Shopping Sales Bot API',
}));

// Root & Health Checks
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SalesBOT AI Backend is running successfully!',
    docs: '/api-docs',
    health: '/health',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Shopping Sales Bot API',
    version: '2.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/products', productRoutes);
app.use('/api', miscRoutes); // /api/price/:productId, /api/reviews/:productId
app.use('/api', userRoutes); // /api/wishlist, /api/history

// Error Handlers
app.use(notFound);
app.use(errorHandler);

// Automatically sync Prisma database schema on startup for cloud environments (Render/Vercel)
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')) {
  try {
    const { execSync } = require('child_process');
    console.log('🔄 Verifying and syncing database schema with cloud PostgreSQL...');
    execSync('npx prisma db push --accept-data-loss', {
      cwd: path.resolve(__dirname, '..'),
      env: process.env,
      stdio: 'inherit'
    });
    console.log('✅ Database tables verified and pushed successfully!');
  } catch (err) {
    console.error('⚠️ Could not auto-sync database schema on startup:', err.message);
  }
}

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   🛍️  AI Shopping Sales Bot API                          ║');
  console.log(`║   🚀  Server running on http://localhost:${PORT}             ║`);
  console.log(`║   📚  API Docs: http://localhost:${PORT}/api-docs            ║`);
  console.log(`║   🔧  Environment: ${(process.env.NODE_ENV || 'development').padEnd(38)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
