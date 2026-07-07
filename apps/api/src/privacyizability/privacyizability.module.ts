import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PrivacyizabilityAdminService } from './privacyizability-admin.service.js'
import { PrivacyizabilityController } from './privacyizability.controller.js'
import { PrivacyizabilityStatusService } from './privacyizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PrivacyizabilityController],
  providers: [PrivacyizabilityStatusService, PrivacyizabilityAdminService],
  exports: [PrivacyizabilityAdminService],
})
export class PrivacyizabilityModule {}
