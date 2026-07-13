import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { ObservabilityModule } from '../observability/observability.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { UsageModule } from '../usage/usage.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AdvancedShieldService } from './advanced-shield.service.js'
import { DeterministicShieldClassifier } from './deterministic-shield.classifier.js'
import { ShieldAdminService } from './shield-admin.service.js'
import { ShieldController } from './shield.controller.js'
import { ShieldFalsePositiveService } from './shield-false-positive.service.js'
import { ShieldFullScanRetainService } from './shield-full-scan-retain.service.js'
import { ShieldOverrideService } from './shield-override.service.js'

@Module({
  imports: [
    ObservabilityModule,
    PersistenceModule,
    UsageModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ShieldController],
  providers: [
    AdvancedShieldService,
    DeterministicShieldClassifier,
    ShieldAdminService,
    ShieldOverrideService,
    ShieldFalsePositiveService,
    ShieldFullScanRetainService,
  ],
  exports: [
    AdvancedShieldService,
    ShieldAdminService,
    ShieldOverrideService,
    ShieldFalsePositiveService,
    ShieldFullScanRetainService,
  ],
})
export class ShieldModule {}
