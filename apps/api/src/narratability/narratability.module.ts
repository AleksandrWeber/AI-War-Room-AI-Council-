import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NarratabilityAdminService } from './narratability-admin.service.js'
import { NarratabilityController } from './narratability.controller.js'
import { NarratabilityStatusService } from './narratability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NarratabilityController],
  providers: [NarratabilityStatusService, NarratabilityAdminService],
  exports: [NarratabilityAdminService],
})
export class NarratabilityModule {}
