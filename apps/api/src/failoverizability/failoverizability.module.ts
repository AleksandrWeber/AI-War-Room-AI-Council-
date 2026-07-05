import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { FailoverizabilityAdminService } from './failoverizability-admin.service.js'
import { FailoverizabilityController } from './failoverizability.controller.js'
import { FailoverizabilityStatusService } from './failoverizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [FailoverizabilityController],
  providers: [FailoverizabilityStatusService, FailoverizabilityAdminService],
  exports: [FailoverizabilityAdminService],
})
export class FailoverizabilityModule {}
