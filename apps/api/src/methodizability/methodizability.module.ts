import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MethodizabilityAdminService } from './methodizability-admin.service.js'
import { MethodizabilityController } from './methodizability.controller.js'
import { MethodizabilityStatusService } from './methodizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MethodizabilityController],
  providers: [MethodizabilityStatusService, MethodizabilityAdminService],
  exports: [MethodizabilityAdminService],
})
export class MethodizabilityModule {}
