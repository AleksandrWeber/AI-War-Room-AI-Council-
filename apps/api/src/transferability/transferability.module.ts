import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TransferabilityAdminService } from './transferability-admin.service.js'
import { TransferabilityController } from './transferability.controller.js'
import { TransferabilityStatusService } from './transferability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TransferabilityController],
  providers: [TransferabilityStatusService, TransferabilityAdminService],
  exports: [TransferabilityAdminService],
})
export class TransferabilityModule {}
