import { Router, Request, Response } from 'express';

export function metricsRoutes(): Router {
  const app = Router();

  // Metrics endpoint
  app.get('/', async (req: Request, res: Response) => {
    try {
      res.json({
        totalRequests: 15420,
        successfulRequests: 14890,
        failedRequests: 530,
        averageLatency: 245,
        keyDistribution: {
          openai: 45,
          anthropic: 25,
          gemini: 15,
          moonshot: 10,
          zhipu: 5
        },
        timestamp: new Date()
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Metrics history endpoint
  app.get('/history', async (req: Request, res: Response) => {
    try {
      const period = req.query.period || '24h';
      // Generate mock historical data
      const data = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        requests: Math.floor(Math.random() * 500) + 100,
        latency: Math.floor(Math.random() * 100) + 50,
        successRate: 95 + Math.random() * 5
      }));
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return app;
}
