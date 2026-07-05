import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DeployabilityAdminService } from './deployability-admin.service.js'
import { DeployabilityController } from './deployability.controller.js'
import { DeployabilityStatusService } from './deployability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DeployabilityController],
  providers: [DeployabilityStatusService, DeployabilityAdminService],
  exports: [DeployabilityAdminService],
})
export class DeployabilityModule {}
