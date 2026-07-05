import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReferencizabilityAdminService } from './referencizability-admin.service.js'
import { ReferencizabilityController } from './referencizability.controller.js'
import { ReferencizabilityStatusService } from './referencizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReferencizabilityController],
  providers: [ReferencizabilityStatusService, ReferencizabilityAdminService],
  exports: [ReferencizabilityAdminService],
})
export class ReferencizabilityModule {}
