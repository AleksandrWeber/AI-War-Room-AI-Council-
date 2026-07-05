import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InventoryizabilityAdminService } from './inventoryizability-admin.service.js'
import { InventoryizabilityController } from './inventoryizability.controller.js'
import { InventoryizabilityStatusService } from './inventoryizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [InventoryizabilityController],
  providers: [InventoryizabilityStatusService, InventoryizabilityAdminService],
  exports: [InventoryizabilityAdminService],
})
export class InventoryizabilityModule {}
