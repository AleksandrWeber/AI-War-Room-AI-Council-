import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SuitabilityAdminService } from './suitability-admin.service.js'
import { SuitabilityController } from './suitability.controller.js'
import { SuitabilityStatusService } from './suitability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SuitabilityController],
  providers: [SuitabilityStatusService, SuitabilityAdminService],
  exports: [SuitabilityAdminService],
})
export class SuitabilityModule {}
