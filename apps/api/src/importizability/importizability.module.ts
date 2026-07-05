import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ImportizabilityAdminService } from './importizability-admin.service.js'
import { ImportizabilityController } from './importizability.controller.js'
import { ImportizabilityStatusService } from './importizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ImportizabilityController],
  providers: [ImportizabilityStatusService, ImportizabilityAdminService],
  exports: [ImportizabilityAdminService],
})
export class ImportizabilityModule {}
