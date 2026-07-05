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
import { ConfigurabilityModule } from './configurability/configurability.module.js'
import { CustomizabilityModule } from './customizability/customizability.module.js'
import { OperabilityModule } from './operability/operability.module.js'
import { TunabilityModule } from './tunability/tunability.module.js'
import { AdjustabilityModule } from './adjustability/adjustability.module.js'
import { ProgrammabilityModule } from './programmability/programmability.module.js'
import { DeployabilityModule } from './deployability/deployability.module.js'
import { ManageabilityModule } from './manageability/manageability.module.js'
import { ControllabilityModule } from './controllability/controllability.module.js'
import { IntegrabilityModule } from './integrability/integrability.module.js'
import { OrchestrabilityModule } from './orchestrability/orchestrability.module.js'
import { SchedulabilityModule } from './schedulability/schedulability.module.js'
import { AutomatabilityModule } from './automatability/automatability.module.js'
import { MonitorabilityModule } from './monitorability/monitorability.module.js'
import { PredictabilityModule } from './predictability/predictability.module.js'
import { RepeatabilityModule } from './repeatability/repeatability.module.js'
import { ResponsivenessModule } from './responsiveness/responsiveness.module.js'
import { DependabilityModule } from './dependability/dependability.module.js'
import { ComposabilityModule } from './composability/composability.module.js'
import { TrustworthinessModule } from './trustworthiness/trustworthiness.module.js'
import { UsabilityModule } from './usability/usability.module.js'
import { AccessibilityModule } from './accessibility/accessibility.module.js'
import { EffectivenessModule } from './effectiveness/effectiveness.module.js'
import { AppropriatenessModule } from './appropriateness/appropriateness.module.js'
import { SurvivabilityModule } from './survivability/survivability.module.js'
import { ViabilityModule } from './viability/viability.module.js'
import { FeasibilityModule } from './feasibility/feasibility.module.js'
import { ConformanceModule } from './conformance/conformance.module.js'
import { AdoptabilityModule } from './adoptability/adoptability.module.js'
import { AcceptabilityModule } from './acceptability/acceptability.module.js'
import { AffordabilityModule } from './affordability/affordability.module.js'
import { DesirabilityModule } from './desirability/desirability.module.js'
import { MarketabilityModule } from './marketability/marketability.module.js'
import { SuitabilityModule } from './suitability/suitability.module.js'
import { ProfitabilityModule } from './profitability/profitability.module.js'
import { LearnabilityModule } from './learnability/learnability.module.js'
import { DeliverabilityModule } from './deliverability/deliverability.module.js'
import { UnderstandabilityModule } from './understandability/understandability.module.js'
import { MemorabilityModule } from './memorability/memorability.module.js'
import { TeachabilityModule } from './teachability/teachability.module.js'
import { ReadabilityModule } from './readability/readability.module.js'
import { ClarityModule } from './clarity/clarity.module.js'
import { SimplicityModule } from './simplicity/simplicity.module.js'
import { NegotiabilityModule } from './negotiability/negotiability.module.js'
import { ComprehensibilityModule } from './comprehensibility/comprehensibility.module.js'
import { IntelligibilityModule } from './intelligibility/intelligibility.module.js'
import { LegibilityModule } from './legibility/legibility.module.js'
import { ParsabilityModule } from './parsability/parsability.module.js'
import { CoherenceModule } from './coherence/coherence.module.js'
import { FamiliarityModule } from './familiarity/familiarity.module.js'
import { RecognizabilityModule } from './recognizability/recognizability.module.js'
import { InterpretabilityModule } from './interpretability/interpretability.module.js'
import { ScannabilityModule } from './scannability/scannability.module.js'
import { PerceptibilityModule } from './perceptibility/perceptibility.module.js'
import { NoticeabilityModule } from './noticeability/noticeability.module.js'
import { DiscernibilityModule } from './discernibility/discernibility.module.js'
import { DistinctivenessModule } from './distinctiveness/distinctiveness.module.js'
import { ConspicuousnessModule } from './conspicuousness/conspicuousness.module.js'
import { DetectabilityModule } from './detectability/detectability.module.js'
import { DescribabilityModule } from './describability/describability.module.js'
import { ExpressivenessModule } from './expressiveness/expressiveness.module.js'
import { CommunicabilityModule } from './communicability/communicability.module.js'
import { ArticulabilityModule } from './articulability/articulability.module.js'
import { ElaboratabilityModule } from './elaboratability/elaboratability.module.js'
import { RepresentabilityModule } from './representability/representability.module.js'
import { PresentabilityModule } from './presentability/presentability.module.js'
import { EnunciabilityModule } from './enunciability/enunciability.module.js'
import { FormulatabilityModule } from './formulatability/formulatability.module.js'
import { NarratabilityModule } from './narratability/narratability.module.js'
import { IllustratabilityModule } from './illustratability/illustratability.module.js'
import { SymbolizabilityModule } from './symbolizability/symbolizability.module.js'
import { VisualizabilityModule } from './visualizability/visualizability.module.js'
import { EvocatabilityModule } from './evocatability/evocatability.module.js'
import { SignifiabilityModule } from './signifiability/signifiability.module.js'
import { ConnotabilityModule } from './connotability/connotability.module.js'
import { TypifiabilityModule } from './typifiability/typifiability.module.js'
import { MetaphorizabilityModule } from './metaphorizability/metaphorizability.module.js'
import { DramatizabilityModule } from './dramatizability/dramatizability.module.js'
import { PersonifiabilityModule } from './personifiability/personifiability.module.js'
import { MaterializabilityModule } from './materializability/materializability.module.js'
import { IconizabilityModule } from './iconizability/iconizability.module.js'
import { AllegorizabilityModule } from './allegorizability/allegorizability.module.js'
import { TokenizabilityModule } from './tokenizability/tokenizability.module.js'
import { StylizabilityModule } from './stylizability/stylizability.module.js'
import { EmblemizabilityModule } from './emblemizability/emblemizability.module.js'
import { AnalogizabilityModule } from './analogizability/analogizability.module.js'
import { ParabolizabilityModule } from './parabolizability/parabolizability.module.js'
import { ArchetypizabilityModule } from './archetypizability/archetypizability.module.js'
import { CaracterizabilityModule } from './caracterizability/caracterizability.module.js'
import { MythicizabilityModule } from './mythicizability/mythicizability.module.js'
import { SemiotizabilityModule } from './semiotizability/semiotizability.module.js'
import { HermeneutizabilityModule } from './hermeneutizability/hermeneutizability.module.js'
import { LexicalizabilityModule } from './lexicalizability/lexicalizability.module.js'
import { SemanticizabilityModule } from './semanticizability/semanticizability.module.js'
import { PragmatizabilityModule } from './pragmatizability/pragmatizability.module.js'
import { SyntacticizabilityModule } from './syntacticizability/syntacticizability.module.js'
import { RhetorizabilityModule } from './rhetorizability/rhetorizability.module.js'
import { MorphizabilityModule } from './morphizability/morphizability.module.js'
import { CodifiabilityModule } from './codifiability/codifiability.module.js'
import { HermeticizabilityModule } from './hermeticizability/hermeticizability.module.js'
import { EpistemizabilityModule } from './epistemizability/epistemizability.module.js'
import { DialectizabilityModule } from './dialectizability/dialectizability.module.js'
import { OntologizabilityModule } from './ontologizability/ontologizability.module.js'
import { PhenomenizabilityModule } from './phenomenizability/phenomenizability.module.js'
import { AxiologizabilityModule } from './axiologizability/axiologizability.module.js'
import { TeleologizabilityModule } from './teleologizability/teleologizability.module.js'
import { GnoseizabilityModule } from './gnoseizability/gnoseizability.module.js'
import { MethodizabilityModule } from './methodizability/methodizability.module.js'
import { HistorizabilityModule } from './historizability/historizability.module.js'
import { CategorizabilityModule } from './categorizability/categorizability.module.js'
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
    ConfigurabilityModule,
    CustomizabilityModule,
    OperabilityModule,
    TunabilityModule,
    AdjustabilityModule,
    ProgrammabilityModule,
    DeployabilityModule,
    ManageabilityModule,
    ControllabilityModule,
    IntegrabilityModule,
    OrchestrabilityModule,
    SchedulabilityModule,
    AutomatabilityModule,
    MonitorabilityModule,
    PredictabilityModule,
    RepeatabilityModule,
    ResponsivenessModule,
    DependabilityModule,
    ComposabilityModule,
    TrustworthinessModule,
    UsabilityModule,
    AccessibilityModule,
    EffectivenessModule,
    AppropriatenessModule,
    SurvivabilityModule,
    ViabilityModule,
    FeasibilityModule,
    ConformanceModule,
    AdoptabilityModule,
    AcceptabilityModule,
    AffordabilityModule,
    DesirabilityModule,
    MarketabilityModule,
    SuitabilityModule,
    ProfitabilityModule,
    LearnabilityModule,
    DeliverabilityModule,
    UnderstandabilityModule,
    MemorabilityModule,
    TeachabilityModule,
    ReadabilityModule,
    ClarityModule,
    SimplicityModule,
    NegotiabilityModule,
    ComprehensibilityModule,
    IntelligibilityModule,
    LegibilityModule,
    ParsabilityModule,
    CoherenceModule,
    FamiliarityModule,
    RecognizabilityModule,
    InterpretabilityModule,
    ScannabilityModule,
    PerceptibilityModule,
    NoticeabilityModule,
    DiscernibilityModule,
    DistinctivenessModule,
    ConspicuousnessModule,
    DetectabilityModule,
    DescribabilityModule,
    ExpressivenessModule,
    CommunicabilityModule,
    ArticulabilityModule,
    ElaboratabilityModule,
    RepresentabilityModule,
    PresentabilityModule,
    EnunciabilityModule,
    FormulatabilityModule,
    NarratabilityModule,
    IllustratabilityModule,
    SymbolizabilityModule,
    VisualizabilityModule,
    EvocatabilityModule,
    SignifiabilityModule,
    ConnotabilityModule,
    TypifiabilityModule,
    MetaphorizabilityModule,
    DramatizabilityModule,
    PersonifiabilityModule,
    MaterializabilityModule,
    IconizabilityModule,
    AllegorizabilityModule,
    TokenizabilityModule,
    StylizabilityModule,
    EmblemizabilityModule,
    AnalogizabilityModule,
    ParabolizabilityModule,
    ArchetypizabilityModule,
    CaracterizabilityModule,
    MythicizabilityModule,
    SemiotizabilityModule,
    HermeneutizabilityModule,
    LexicalizabilityModule,
    SemanticizabilityModule,
    PragmatizabilityModule,
    SyntacticizabilityModule,
    RhetorizabilityModule,
    MorphizabilityModule,
    CodifiabilityModule,
    HermeticizabilityModule,
    EpistemizabilityModule,
    DialectizabilityModule,
    OntologizabilityModule,
    PhenomenizabilityModule,
    AxiologizabilityModule,
    TeleologizabilityModule,
    GnoseizabilityModule,
    MethodizabilityModule,
    HistorizabilityModule,
    CategorizabilityModule,
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
