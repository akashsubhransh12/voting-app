import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// __dirname removed as it was unused
// const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Election Roll API
  app.get('/api/electoral-roll/search', (req, res) => {
    const { q } = req.query;
    // Simulate a search database
    res.json({
      results: [
        { name: "Sample Voter", epic: "ABC1234567", station: "Station 42, Delhi", part: "12" },
        { name: "John Doe", epic: "XYZ7890123", station: "Station 10, Mumbai", part: "5" }
      ],
      query: q
    });
  });

  // Mock e-EPIC Download
  app.get('/api/voter/e-epic', (req, res) => {
    res.json({
      downloadUrl: "https://example.com/mock-epic-voter.pdf",
      status: "verified",
      voterName: "Sample Voter",
      epicNumber: "ABC1234567"
    });
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mock Alert System for Irregularities
  app.post('/api/alerts/report', (req, res) => {
    const { type, message, location } = req.body;
    console.log(`[ALERT] ${type}: ${message} at ${location}`);
    // In a real app, this would trigger email/SMS or save to a security log
    res.status(202).json({ message: 'Alert reported and logged for review.' });
  });

  // Analytics Proxy / Report Generator
  app.get('/api/reports/summary', (req, res) => {
    // This could perform complex aggregations or call a data warehouse
    res.json({
      summary: "Detailed report generation would happen here.",
      timestamp: new Date().toISOString()
    });
  });

  // Vite Middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
