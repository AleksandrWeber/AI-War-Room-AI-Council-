import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CorroborizabilityAdminService } from './corroborizability-admin.service.js'
import { CorroborizabilityController } from './corroborizability.controller.js'
import { CorroborizabilityStatusService } from './corroborizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CorroborizabilityController],
  providers: [CorroborizabilityStatusService, CorroborizabilityAdminService],
  exports: [CorroborizabilityAdminService],
})
export class CorroborizabilityModule {}
