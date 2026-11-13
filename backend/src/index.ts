import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { authRouter } from './routes/auth.routes.js';
import { profileRouter } from './routes/profile.routes.js';
import { materialsRouter } from './routes/materials.routes.js';
import { requestsRouter } from './routes/requests.routes.js';
import { messagesRouter } from './routes/messages.routes.js';
import { ordersRouter } from './routes/orders.routes.js';
import { checkoutRouter } from './routes/checkout.routes.js';
import { sellerRouter } from './routes/seller.routes.js';
import { impactRouter } from './routes/impact.routes.js';
import { savedRouter } from './routes/saved.routes.js';
import { notificationsRouter } from './routes/notifications.routes.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logger for debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'EcoLoop API',
    tagline: 'Turning Leftovers into Leverages',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/impact', impactRouter);
app.use('/api/saved', savedRouter);
app.use('/api/notifications', notificationsRouter);

// Serve Frontend SPA from the same link!
let frontendDistPath = path.resolve(process.cwd(), '../frontend/dist');
if (!fs.existsSync(frontendDistPath)) {
  frontendDistPath = path.resolve(process.cwd(), 'frontend/dist');
}

if (fs.existsSync(frontendDistPath)) {
  console.log(`📦 Serving compiled EcoLoop frontend from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // For any non-API client route, serve index.html
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start Server with fallback port handling
function startServer(port: number) {
  const server = app.listen(port, () => {
    console.log(`=======================================================`);
    console.log(`🌱 EcoLoop Unified Full-Stack live at: http://localhost:${port}`);
    console.log(`🌐 Frontend & Backend both available in ONE link!`);
    console.log(`🔌 Health check endpoint:   http://localhost:${port}/api/health`);
    console.log(`=======================================================`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
