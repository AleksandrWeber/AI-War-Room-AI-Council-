import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { FeatureflagizabilityAdminService } from './featureflagizability-admin.service.js'
import { FeatureflagizabilityController } from './featureflagizability.controller.js'
import { FeatureflagizabilityStatusService } from './featureflagizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [FeatureflagizabilityController],
  providers: [FeatureflagizabilityStatusService, FeatureflagizabilityAdminService],
  exports: [FeatureflagizabilityAdminService],
})
export class FeatureflagizabilityModule {}
