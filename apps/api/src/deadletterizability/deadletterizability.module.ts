import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DeadletterizabilityAdminService } from './deadletterizability-admin.service.js'
import { DeadletterizabilityController } from './deadletterizability.controller.js'
import { DeadletterizabilityStatusService } from './deadletterizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DeadletterizabilityController],
  providers: [DeadletterizabilityStatusService, DeadletterizabilityAdminService],
  exports: [DeadletterizabilityAdminService],
})
export class DeadletterizabilityModule {}
