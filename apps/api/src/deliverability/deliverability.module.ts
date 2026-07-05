import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DeliverabilityAdminService } from './deliverability-admin.service.js'
import { DeliverabilityController } from './deliverability.controller.js'
import { DeliverabilityStatusService } from './deliverability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DeliverabilityController],
  providers: [DeliverabilityStatusService, DeliverabilityAdminService],
  exports: [DeliverabilityAdminService],
})
export class DeliverabilityModule {}
