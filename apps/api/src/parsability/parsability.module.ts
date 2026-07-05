import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ParsabilityAdminService } from './parsability-admin.service.js'
import { ParsabilityController } from './parsability.controller.js'
import { ParsabilityStatusService } from './parsability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ParsabilityController],
  providers: [ParsabilityStatusService, ParsabilityAdminService],
  exports: [ParsabilityAdminService],
})
export class ParsabilityModule {}
