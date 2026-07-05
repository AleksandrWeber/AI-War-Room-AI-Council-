import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MeshingizabilityAdminService } from './meshingizability-admin.service.js'
import { MeshingizabilityController } from './meshingizability.controller.js'
import { MeshingizabilityStatusService } from './meshingizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MeshingizabilityController],
  providers: [MeshingizabilityStatusService, MeshingizabilityAdminService],
  exports: [MeshingizabilityAdminService],
})
export class MeshingizabilityModule {}
