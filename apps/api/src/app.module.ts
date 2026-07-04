import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validateEnv } from './config/env.js'
import { HealthModule } from './health/health.module.js'
import { RunsModule } from './runs/runs.module.js'
import { VersionModule } from './version/version.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    HealthModule,
    VersionModule,
    RunsModule,
  ],
})
export class AppModule {}
