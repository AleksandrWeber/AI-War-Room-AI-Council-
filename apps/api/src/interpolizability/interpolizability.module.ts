import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InterpolizabilityAdminService } from './interpolizability-admin.service.js'
import { InterpolizabilityController } from './interpolizability.controller.js'
import { InterpolizabilityStatusService } from './interpolizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [InterpolizabilityController],
  providers: [InterpolizabilityStatusService, InterpolizabilityAdminService],
  exports: [InterpolizabilityAdminService],
})
export class InterpolizabilityModule {}
