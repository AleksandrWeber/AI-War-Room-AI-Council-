import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RecoverizabilityAdminService } from './recoverizability-admin.service.js'
import { RecoverizabilityController } from './recoverizability.controller.js'
import { RecoverizabilityStatusService } from './recoverizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RecoverizabilityController],
  providers: [RecoverizabilityStatusService, RecoverizabilityAdminService],
  exports: [RecoverizabilityAdminService],
})
export class RecoverizabilityModule {}
