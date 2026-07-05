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
import { AccountabilityModule } from './accountability/accountability.module.js'
import { TransparencyModule } from './transparency/transparency.module.js'
import { AttestationModule } from './attestation/attestation.module.js'
import { AuthenticityModule } from './authenticity/authenticity.module.js'
import { ProvenanceModule } from './provenance/provenance.module.js'
import { VerifiabilityModule } from './verifiability/verifiability.module.js'
import { ConfirmabilityModule } from './confirmability/confirmability.module.js'
import { ValidityModule } from './validity/validity.module.js'
import { CredibilityModule } from './credibility/credibility.module.js'
import { ReproducibilityModule } from './reproducibility/reproducibility.module.js'
import { DefensibilityModule } from './defensibility/defensibility.module.js'
import { AuditabilityModule } from './auditability/auditability.module.js'
import { InspectabilityModule } from './inspectability/inspectability.module.js'
import { ExplainabilityModule } from './explainability/explainability.module.js'
import { DemonstrabilityModule } from './demonstrability/demonstrability.module.js'
import { JustifiabilityModule } from './justifiability/justifiability.module.js'
import { ReviewabilityModule } from './reviewability/reviewability.module.js'
import { AssessabilityModule } from './assessability/assessability.module.js'
import { MeasurabilityModule } from './measurability/measurability.module.js'
import { CertifiabilityModule } from './certifiability/certifiability.module.js'
import { SubstantiabilityModule } from './substantiability/substantiability.module.js'
import { WarrantabilityModule } from './warrantability/warrantability.module.js'
import { AttributabilityModule } from './attributability/attributability.module.js'
import { IdentifiabilityModule } from './identifiability/identifiability.module.js'
import { ComparabilityModule } from './comparability/comparability.module.js'
import { DistinguishabilityModule } from './distinguishability/distinguishability.module.js'
import { AssignabilityModule } from './assignability/assignability.module.js'
import { ReferencabilityModule } from './referencability/referencability.module.js'
import { LocatabilityModule } from './locatability/locatability.module.js'
import { RetrievabilityModule } from './retrievability/retrievability.module.js'
import { DiscoverabilityModule } from './discoverability/discoverability.module.js'
import { NavigabilityModule } from './navigability/navigability.module.js'
import { ConnectabilityModule } from './connectability/connectability.module.js'
import { LinkabilityModule } from './linkability/linkability.module.js'
import { InterchangeabilityModule } from './interchangeability/interchangeability.module.js'
import { TransferabilityModule } from './transferability/transferability.module.js'
import { PortabilityModule } from './portability/portability.module.js'
import { CompatibilityModule } from './compatibility/compatibility.module.js'
import { AdaptabilityModule } from './adaptability/adaptability.module.js'
import { FlexibilityModule } from './flexibility/flexibility.module.js'
import { ExtensibilityModule } from './extensibility/extensibility.module.js'
import { ModifiabilityModule } from './modifiability/modifiability.module.js'
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
    AccountabilityModule,
    TransparencyModule,
    AttestationModule,
    AuthenticityModule,
    ProvenanceModule,
    VerifiabilityModule,
    ConfirmabilityModule,
    ValidityModule,
    CredibilityModule,
    ReproducibilityModule,
    DefensibilityModule,
    AuditabilityModule,
    InspectabilityModule,
    ExplainabilityModule,
    DemonstrabilityModule,
    JustifiabilityModule,
    ReviewabilityModule,
    AssessabilityModule,
    MeasurabilityModule,
    CertifiabilityModule,
    SubstantiabilityModule,
    WarrantabilityModule,
    AttributabilityModule,
    IdentifiabilityModule,
    ComparabilityModule,
    DistinguishabilityModule,
    AssignabilityModule,
    ReferencabilityModule,
    LocatabilityModule,
    RetrievabilityModule,
    DiscoverabilityModule,
    NavigabilityModule,
    ConnectabilityModule,
    LinkabilityModule,
    InterchangeabilityModule,
    TransferabilityModule,
    PortabilityModule,
    CompatibilityModule,
    AdaptabilityModule,
    FlexibilityModule,
    ExtensibilityModule,
    ModifiabilityModule,
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
