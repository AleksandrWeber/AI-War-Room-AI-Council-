import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TroubleshootizabilityAdminService } from './troubleshootizability-admin.service.js'
import { TroubleshootizabilityController } from './troubleshootizability.controller.js'
import { TroubleshootizabilityStatusService } from './troubleshootizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TroubleshootizabilityController],
  providers: [TroubleshootizabilityStatusService, TroubleshootizabilityAdminService],
  exports: [TroubleshootizabilityAdminService],
})
export class TroubleshootizabilityModule {}
