import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InterchangeabilityAdminService } from './interchangeability-admin.service.js'
import { InterchangeabilityController } from './interchangeability.controller.js'
import { InterchangeabilityStatusService } from './interchangeability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [InterchangeabilityController],
  providers: [InterchangeabilityStatusService, InterchangeabilityAdminService],
  exports: [InterchangeabilityAdminService],
})
export class InterchangeabilityModule {}
