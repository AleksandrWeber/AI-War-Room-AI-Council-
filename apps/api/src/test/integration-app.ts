import { Test } from '@nestjs/testing'
import type { TestingModule } from '@nestjs/testing'
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { AppModule } from '../app.module.js'

let app: NestFastifyApplication | undefined
let initPromise: Promise<NestFastifyApplication> | undefined

export async function getIntegrationApp(): Promise<NestFastifyApplication> {
  if (app) {
    return app
  }

  if (!initPromise) {
    initPromise = (async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile()

      const nestApp = moduleRef.createNestApplication<NestFastifyApplication>(
        new FastifyAdapter(),
      )
      nestApp.setGlobalPrefix('api')
      await nestApp.init()
      await nestApp.getHttpAdapter().getInstance().ready()
      app = nestApp
      return nestApp
    })()
  }

  return initPromise
}

export async function closeIntegrationApp(): Promise<void> {
  if (app) {
    await app.close()
    app = undefined
    initPromise = undefined
  }
}
