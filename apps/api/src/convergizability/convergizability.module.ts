import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConvergizabilityAdminService } from './convergizability-admin.service.js'
import { ConvergizabilityController } from './convergizability.controller.js'
import { ConvergizabilityStatusService } from './convergizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConvergizabilityController],
  providers: [ConvergizabilityStatusService, ConvergizabilityAdminService],
  exports: [ConvergizabilityAdminService],
})
export class ConvergizabilityModule {}
