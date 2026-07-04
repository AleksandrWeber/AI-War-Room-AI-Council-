import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { AppModule } from './app.module.js'
import type { ApiEnv } from './config/env.js'

export async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { rawBody: true },
  )
  const config = app.get(ConfigService<ApiEnv, true>)
  const port = config.get('API_PORT', { infer: true })
  const webOrigin = config.get('WEB_ORIGIN', { infer: true })

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: webOrigin,
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'Last-Event-ID',
      'x-user-id',
      'x-workspace-id',
    ],
  })

  await app.listen(port)
  console.log(`AI War Room API listening on http://127.0.0.1:${port}`)
}

if (process.env.NODE_ENV !== 'test') {
  void bootstrap()
}
