import { Router, Request, Response } from 'express';
import { SmartRouter } from '../core/router';

export function chatRoutes(router: SmartRouter): Router {
  const app = Router();

  // Chat completions endpoint
  app.post('/chat/completions', async (req: Request, res: Response) => {
    try {
      const { model, messages, stream = false, ...options } = req.body;

      if (!model || !messages) {
        return res.status(400).json({
          error: {
            message: 'model and messages are required',
            code: 'MISSING_FIELDS'
          }
        });
      }

      if (stream) {
        // Set headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Stream response
        for await (const chunk of router.chatStream(model, messages, options)) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        const response = await router.chat(model, messages, options);
        res.json(response);
      }
    } catch (error: any) {
      res.status(500).json({
        error: {
          message: error.message || 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  });

  // Models endpoint
  app.get('/models', async (req: Request, res: Response) => {
    try {
      // This would return available models from all adapters
      res.json({
        object: 'list',
        data: [
          { id: 'gpt-4', object: 'model', created: Date.now(), owned_by: 'openai' },
          { id: 'claude-3-opus', object: 'model', created: Date.now(), owned_by: 'anthropic' },
          { id: 'moonshot-v1', object: 'model', created: Date.now(), owned_by: 'moonshot' }
        ]
      });
    } catch (error: any) {
      res.status(500).json({
        error: {
          message: error.message || 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  });

  return app;
}
