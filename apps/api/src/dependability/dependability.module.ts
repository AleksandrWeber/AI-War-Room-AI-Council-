import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DependabilityAdminService } from './dependability-admin.service.js'
import { DependabilityController } from './dependability.controller.js'
import { DependabilityStatusService } from './dependability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DependabilityController],
  providers: [DependabilityStatusService, DependabilityAdminService],
  exports: [DependabilityAdminService],
})
export class DependabilityModule {}
