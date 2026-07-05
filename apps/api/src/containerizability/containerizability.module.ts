import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ContainerizabilityAdminService } from './containerizability-admin.service.js'
import { ContainerizabilityController } from './containerizability.controller.js'
import { ContainerizabilityStatusService } from './containerizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ContainerizabilityController],
  providers: [ContainerizabilityStatusService, ContainerizabilityAdminService],
  exports: [ContainerizabilityAdminService],
})
export class ContainerizabilityModule {}
