import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RetrievabilityAdminService } from './retrievability-admin.service.js'
import { RetrievabilityController } from './retrievability.controller.js'
import { RetrievabilityStatusService } from './retrievability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RetrievabilityController],
  providers: [RetrievabilityStatusService, RetrievabilityAdminService],
  exports: [RetrievabilityAdminService],
})
export class RetrievabilityModule {}
