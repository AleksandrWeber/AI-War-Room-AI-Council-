import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ComparabilityAdminService } from './comparability-admin.service.js'
import { ComparabilityController } from './comparability.controller.js'
import { ComparabilityStatusService } from './comparability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ComparabilityController],
  providers: [ComparabilityStatusService, ComparabilityAdminService],
  exports: [ComparabilityAdminService],
})
export class ComparabilityModule {}
