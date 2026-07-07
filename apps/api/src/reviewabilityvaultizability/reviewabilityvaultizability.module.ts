import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReviewabilityvaultizabilityAdminService } from './reviewabilityvaultizability-admin.service.js'
import { ReviewabilityvaultizabilityController } from './reviewabilityvaultizability.controller.js'
import { ReviewabilityvaultizabilityStatusService } from './reviewabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReviewabilityvaultizabilityController],
  providers: [ReviewabilityvaultizabilityStatusService, ReviewabilityvaultizabilityAdminService],
  exports: [ReviewabilityvaultizabilityAdminService],
})
export class ReviewabilityvaultizabilityModule {}
