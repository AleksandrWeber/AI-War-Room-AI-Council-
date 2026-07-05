import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RecoverabilityAdminService } from './recoverability-admin.service.js'
import { RecoverabilityController } from './recoverability.controller.js'
import { RecoverabilityStatusService } from './recoverability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RecoverabilityController],
  providers: [RecoverabilityStatusService, RecoverabilityAdminService],
  exports: [RecoverabilityAdminService],
})
export class RecoverabilityModule {}
