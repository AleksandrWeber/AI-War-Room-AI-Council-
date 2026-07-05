import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validateEnv } from './config/env.js'
import { AuthModule } from './auth/auth.module.js'
import { BillingModule } from './billing/billing.module.js'
import { HealthModule } from './health/health.module.js'
import { LlmModule } from './llm/llm.module.js'
import { ModelRouterModule } from './model-router/model-router.module.js'
import { ObservabilityModule } from './observability/observability.module.js'
import { ProviderCredentialsModule } from './provider-credentials/provider-credentials.module.js'
import { RunsModule } from './runs/runs.module.js'
import { ShieldModule } from './shield/shield.module.js'
import { VersionModule } from './version/version.module.js'
import { WorkspacesModule } from './workspaces/workspaces.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    HealthModule,
    AuthModule,
    BillingModule,
    WorkspacesModule,
    VersionModule,
    ModelRouterModule,
    ObservabilityModule,
    ProviderCredentialsModule,
    LlmModule,
    ShieldModule,
    RunsModule,
  ],
})
export class AppModule {}
