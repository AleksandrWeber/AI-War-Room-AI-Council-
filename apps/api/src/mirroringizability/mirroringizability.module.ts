import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MirroringizabilityAdminService } from './mirroringizability-admin.service.js'
import { MirroringizabilityController } from './mirroringizability.controller.js'
import { MirroringizabilityStatusService } from './mirroringizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MirroringizabilityController],
  providers: [MirroringizabilityStatusService, MirroringizabilityAdminService],
  exports: [MirroringizabilityAdminService],
})
export class MirroringizabilityModule {}
