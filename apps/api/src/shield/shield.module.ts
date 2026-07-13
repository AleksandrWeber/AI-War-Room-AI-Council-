import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { ObservabilityModule } from '../observability/observability.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AdvancedShieldService } from './advanced-shield.service.js'
import { DeterministicShieldClassifier } from './deterministic-shield.classifier.js'
import { ShieldAdminService } from './shield-admin.service.js'
import { ShieldController } from './shield.controller.js'
import { ShieldOverrideService } from './shield-override.service.js'

@Module({
  imports: [
    ObservabilityModule,
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ShieldController],
  providers: [
    AdvancedShieldService,
    DeterministicShieldClassifier,
    ShieldAdminService,
    ShieldOverrideService,
  ],
  exports: [AdvancedShieldService, ShieldAdminService, ShieldOverrideService],
})
export class ShieldModule {}
