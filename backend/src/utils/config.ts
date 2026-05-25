interface AppConfig {
  app: {
    name: string;
    version: string;
    port: number;
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  logging: {
    level: string;
    format: string;
  };
  healthCheck: {
    interval: number;
  };
}

export const config: AppConfig = {
  app: {
    name: process.env.APP_NAME || 'XAPI',
    version: process.env.APP_VERSION || '1.0.0',
    port: parseInt(process.env.PORT || '3001')
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://xapi:password@localhost:5432/xapi'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json'
  },
  healthCheck: {
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '60')
  }
};
