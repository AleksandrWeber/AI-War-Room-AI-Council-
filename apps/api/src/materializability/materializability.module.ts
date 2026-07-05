import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MaterializabilityAdminService } from './materializability-admin.service.js'
import { MaterializabilityController } from './materializability.controller.js'
import { MaterializabilityStatusService } from './materializability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MaterializabilityController],
  providers: [MaterializabilityStatusService, MaterializabilityAdminService],
  exports: [MaterializabilityAdminService],
})
export class MaterializabilityModule {}
