import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DeliverizabilityAdminService } from './deliverizability-admin.service.js'
import { DeliverizabilityController } from './deliverizability.controller.js'
import { DeliverizabilityStatusService } from './deliverizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DeliverizabilityController],
  providers: [DeliverizabilityStatusService, DeliverizabilityAdminService],
  exports: [DeliverizabilityAdminService],
})
export class DeliverizabilityModule {}
