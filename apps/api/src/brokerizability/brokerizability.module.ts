import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { BrokerizabilityAdminService } from './brokerizability-admin.service.js'
import { BrokerizabilityController } from './brokerizability.controller.js'
import { BrokerizabilityStatusService } from './brokerizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [BrokerizabilityController],
  providers: [BrokerizabilityStatusService, BrokerizabilityAdminService],
  exports: [BrokerizabilityAdminService],
})
export class BrokerizabilityModule {}
