import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validateEnv } from './config/env.js'
import { AuthModule } from './auth/auth.module.js'
import { BillingModule } from './billing/billing.module.js'
import { DeploymentModule } from './deployment/deployment.module.js'
import { BackupModule } from './backup/backup.module.js'
import { AuditModule } from './audit/audit.module.js'
import { ComplianceModule } from './compliance/compliance.module.js'
import { IncidentsModule } from './incidents/incidents.module.js'
import { ReleasesModule } from './releases/releases.module.js'
import { SloModule } from './slo/slo.module.js'
import { CapacityModule } from './capacity/capacity.module.js'
import { PerformanceModule } from './performance/performance.module.js'
import { ResilienceModule } from './resilience/resilience.module.js'
import { AvailabilityModule } from './availability/availability.module.js'
import { ReliabilityModule } from './reliability/reliability.module.js'
import { StabilityModule } from './stability/stability.module.js'
import { ConsistencyModule } from './consistency/consistency.module.js'
import { IntegrityModule } from './integrity/integrity.module.js'
import { DurabilityModule } from './durability/durability.module.js'
import { RecoverabilityModule } from './recoverability/recoverability.module.js'
import { MaintainabilityModule } from './maintainability/maintainability.module.js'
import { ScalabilityModule } from './scalability/scalability.module.js'
import { TraceabilityModule } from './traceability/traceability.module.js'
import { EfficiencyModule } from './efficiency/efficiency.module.js'
import { OptimizationModule } from './optimization/optimization.module.js'
import { UtilizationModule } from './utilization/utilization.module.js'
import { SustainabilityModule } from './sustainability/sustainability.module.js'
import { GovernanceModule } from './governance/governance.module.js'
import { OversightModule } from './oversight/oversight.module.js'
import { AssuranceModule } from './assurance/assurance.module.js'
import { MigrationsModule } from './migrations/migrations.module.js'
import { EvaluationModule } from './evaluation/evaluation.module.js'
import { HealthModule } from './health/health.module.js'
import { IdempotencyModule } from './idempotency/idempotency.module.js'
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
    DeploymentModule,
    BackupModule,
    AuditModule,
    ComplianceModule,
    IncidentsModule,
    ReleasesModule,
    SloModule,
    CapacityModule,
    PerformanceModule,
    ResilienceModule,
    AvailabilityModule,
    ReliabilityModule,
    StabilityModule,
    ConsistencyModule,
    IntegrityModule,
    DurabilityModule,
    RecoverabilityModule,
    MaintainabilityModule,
    ScalabilityModule,
    TraceabilityModule,
    EfficiencyModule,
    OptimizationModule,
    UtilizationModule,
    SustainabilityModule,
    GovernanceModule,
    OversightModule,
    AssuranceModule,
    MigrationsModule,
    EvaluationModule,
    IdempotencyModule,
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
