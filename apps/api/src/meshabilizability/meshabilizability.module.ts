import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MeshabilizabilityAdminService } from './meshabilizability-admin.service.js'
import { MeshabilizabilityController } from './meshabilizability.controller.js'
import { MeshabilizabilityStatusService } from './meshabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MeshabilizabilityController],
  providers: [MeshabilizabilityStatusService, MeshabilizabilityAdminService],
  exports: [MeshabilizabilityAdminService],
})
export class MeshabilizabilityModule {}
