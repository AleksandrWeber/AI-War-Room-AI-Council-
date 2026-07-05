import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ArticulabilityAdminService } from './articulability-admin.service.js'
import { ArticulabilityController } from './articulability.controller.js'
import { ArticulabilityStatusService } from './articulability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ArticulabilityController],
  providers: [ArticulabilityStatusService, ArticulabilityAdminService],
  exports: [ArticulabilityAdminService],
})
export class ArticulabilityModule {}
