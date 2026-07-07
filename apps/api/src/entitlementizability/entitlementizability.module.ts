import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EntitlementizabilityAdminService } from './entitlementizability-admin.service.js'
import { EntitlementizabilityController } from './entitlementizability.controller.js'
import { EntitlementizabilityStatusService } from './entitlementizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EntitlementizabilityController],
  providers: [EntitlementizabilityStatusService, EntitlementizabilityAdminService],
  exports: [EntitlementizabilityAdminService],
})
export class EntitlementizabilityModule {}
