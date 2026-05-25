import { KeyManager } from './key-manager';
import { SmartRouter } from './router';

export class HealthChecker {
  private keyManager: KeyManager;
  private router: SmartRouter;
  private interval: NodeJS.Timeout | null = null;

  constructor(keyManager: KeyManager, router: SmartRouter) {
    this.keyManager = keyManager;
    this.router = router;
  }

  start(): void {
    // Start health check every minute
    this.interval = setInterval(async () => {
      try {
        await this.keyManager.checkAllKeys();
        console.log('Health check completed');
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 60000); // 1 minute

    console.log('Health checker started');
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('Health checker stopped');
  }

  async checkKey(keyId: string): Promise<any> {
    // This would call the adapter's healthCheck method
    return {
      keyId,
      timestamp: new Date(),
      success: true,
      latency: 150
    };
  }
}
