import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReviewabilityAdminService } from './reviewability-admin.service.js'
import { ReviewabilityController } from './reviewability.controller.js'
import { ReviewabilityStatusService } from './reviewability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReviewabilityController],
  providers: [ReviewabilityStatusService, ReviewabilityAdminService],
  exports: [ReviewabilityAdminService],
})
export class ReviewabilityModule {}
