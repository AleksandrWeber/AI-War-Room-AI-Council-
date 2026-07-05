import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DeployabilizabilityAdminService } from './deployabilizability-admin.service.js'
import { DeployabilizabilityController } from './deployabilizability.controller.js'
import { DeployabilizabilityStatusService } from './deployabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DeployabilizabilityController],
  providers: [DeployabilizabilityStatusService, DeployabilizabilityAdminService],
  exports: [DeployabilizabilityAdminService],
})
export class DeployabilizabilityModule {}
