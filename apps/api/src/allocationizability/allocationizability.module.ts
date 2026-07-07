import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AllocationizabilityAdminService } from './allocationizability-admin.service.js'
import { AllocationizabilityController } from './allocationizability.controller.js'
import { AllocationizabilityStatusService } from './allocationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AllocationizabilityController],
  providers: [AllocationizabilityStatusService, AllocationizabilityAdminService],
  exports: [AllocationizabilityAdminService],
})
export class AllocationizabilityModule {}
