import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ExplainabilityAdminService } from './explainability-admin.service.js'
import { ExplainabilityController } from './explainability.controller.js'
import { ExplainabilityStatusService } from './explainability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ExplainabilityController],
  providers: [ExplainabilityStatusService, ExplainabilityAdminService],
  exports: [ExplainabilityAdminService],
})
export class ExplainabilityModule {}
