import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AssessabilityAdminService } from './assessability-admin.service.js'
import { AssessabilityController } from './assessability.controller.js'
import { AssessabilityStatusService } from './assessability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AssessabilityController],
  providers: [AssessabilityStatusService, AssessabilityAdminService],
  exports: [AssessabilityAdminService],
})
export class AssessabilityModule {}
