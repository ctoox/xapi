import { Router, Request, Response } from 'express';
import { KeyManager } from '../core/key-manager';
import { ProxyManager } from '../core/proxy-manager';
import { HealthChecker } from '../core/health-checker';

export function adminRoutes(
  keyManager: KeyManager,
  proxyManager: ProxyManager,
  healthChecker: HealthChecker
): Router {
  const app = Router();

  // Key management routes
  app.get('/keys', async (req: Request, res: Response) => {
    try {
      const keys = await keyManager.getKeys(req.query as any);
      res.json(keys);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/keys', async (req: Request, res: Response) => {
    try {
      const key = await keyManager.addKey(req.body);
      res.json(key);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/keys/:id', async (req: Request, res: Response) => {
    try {
      const key = await keyManager.updateKey(req.params.id, req.body);
      res.json(key);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/keys/:id', async (req: Request, res: Response) => {
    try {
      await keyManager.deleteKey(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/keys/:id/check', async (req: Request, res: Response) => {
    try {
      const result = await healthChecker.checkKey(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy management routes
  app.get('/proxies', async (req: Request, res: Response) => {
    try {
      const proxies = await proxyManager.getAvailableIPs();
      res.json(proxies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/proxies/fetch', async (req: Request, res: Response) => {
    try {
      const { provider } = req.body;
      const ips = await proxyManager.fetchIPs(provider);
      res.json(ips);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/proxies/:id/test', async (req: Request, res: Response) => {
    try {
      // This would test the latency of a specific proxy
      res.json({ success: true, latency: 150 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Logs routes
  app.get('/logs', async (req: Request, res: Response) => {
    try {
      // This would return request logs from database
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Settings routes
  app.get('/settings', async (req: Request, res: Response) => {
    try {
      res.json({
        healthCheckInterval: 60,
        proxyProvider: null,
        alerts: {}
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/settings', async (req: Request, res: Response) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Tokens routes
  app.get('/tokens', async (req: Request, res: Response) => {
    try {
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/tokens', async (req: Request, res: Response) => {
    try {
      const token = 'xapi-' + Math.random().toString(36).substring(2, 15);
      res.json({ token });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/tokens/:id', async (req: Request, res: Response) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return app;
}
