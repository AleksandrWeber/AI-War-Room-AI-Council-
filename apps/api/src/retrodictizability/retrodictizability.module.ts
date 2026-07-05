import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RetrodictizabilityAdminService } from './retrodictizability-admin.service.js'
import { RetrodictizabilityController } from './retrodictizability.controller.js'
import { RetrodictizabilityStatusService } from './retrodictizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RetrodictizabilityController],
  providers: [RetrodictizabilityStatusService, RetrodictizabilityAdminService],
  exports: [RetrodictizabilityAdminService],
})
export class RetrodictizabilityModule {}
