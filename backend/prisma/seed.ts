import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // Create sample keys
  const keys = await Promise.all([
    prisma.key.create({
      data: {
        platform: 'openai',
        apiKey: process.env.OPENAI_API_KEY || 'sk-sample-openai-key',
        name: 'Sample OpenAI Key',
        models: JSON.stringify(['gpt-4', 'gpt-3.5-turbo', 'gpt-4o']),
        quota: 1000,
        usedQuota: 0,
        status: 'active',
        failureCount: 0
      }
    }),
    prisma.key.create({
      data: {
        platform: 'anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY || 'sk-sample-anthropic-key',
        name: 'Sample Anthropic Key',
        models: JSON.stringify(['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']),
        quota: 500,
        usedQuota: 0,
        status: 'active',
        failureCount: 0
      }
    }),
    prisma.key.create({
      data: {
        platform: 'moonshot',
        apiKey: process.env.MOONSHOT_API_KEY || 'sk-sample-moonshot-key',
        name: 'Sample Moonshot Key',
        models: JSON.stringify(['moonshot-v1', 'moonshot-v1-128k']),
        quota: 200,
        usedQuota: 0,
        status: 'active',
        failureCount: 0
      }
    })
  ])

  console.log(`Created ${keys.length} keys`)

  // Create sample proxy IPs
  const proxies = await Promise.all([
    prisma.proxyIP.create({
      data: {
        ip: '192.168.1.100',
        port: 8080,
        protocol: 'http',
        country: 'US',
        city: 'New York',
        isp: 'Sample ISP',
        latency: 150,
        status: 'available',
        source: 'sample-provider'
      }
    }),
    prisma.proxyIP.create({
      data: {
        ip: '192.168.1.101',
        port: 8080,
        protocol: 'https',
        country: 'UK',
        city: 'London',
        isp: 'Sample ISP 2',
        latency: 200,
        status: 'available',
        source: 'sample-provider'
      }
    })
  ])

  console.log(`Created ${proxies.length} proxy IPs`)

  // Create sample system config
  await prisma.systemConfig.upsert({
    where: { key: 'health_check_interval' },
    update: { value: '60' },
    create: {
      key: 'health_check_interval',
      value: '60',
      description: 'Health check interval in seconds'
    }
  })

  await prisma.systemConfig.upsert({
    where: { key: 'proxy_provider_config' },
    update: { value: JSON.stringify({ name: 'sample-provider', type: 'api', config: {} }) },
    create: {
      key: 'proxy_provider_config',
      value: JSON.stringify({ name: 'sample-provider', type: 'api', config: {} }),
      description: 'Proxy provider configuration'
    }
  })

  console.log('Created system config')

  // Create sample API token
  const token = await prisma.apiToken.create({
    data: {
      name: 'Sample API Token',
      token: 'xapi-' + Math.random().toString(36).substring(2, 15)
    }
  })

  console.log(`Created API token: ${token.token}`)

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
