import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { OrderingizabilityAdminService } from './orderingizability-admin.service.js'
import { OrderingizabilityController } from './orderingizability.controller.js'
import { OrderingizabilityStatusService } from './orderingizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [OrderingizabilityController],
  providers: [OrderingizabilityStatusService, OrderingizabilityAdminService],
  exports: [OrderingizabilityAdminService],
})
export class OrderingizabilityModule {}
