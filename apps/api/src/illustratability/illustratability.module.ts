import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IllustratabilityAdminService } from './illustratability-admin.service.js'
import { IllustratabilityController } from './illustratability.controller.js'
import { IllustratabilityStatusService } from './illustratability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IllustratabilityController],
  providers: [IllustratabilityStatusService, IllustratabilityAdminService],
  exports: [IllustratabilityAdminService],
})
export class IllustratabilityModule {}
