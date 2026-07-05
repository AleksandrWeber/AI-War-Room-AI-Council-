import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RhetorizabilityAdminService } from './rhetorizability-admin.service.js'
import { RhetorizabilityController } from './rhetorizability.controller.js'
import { RhetorizabilityStatusService } from './rhetorizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RhetorizabilityController],
  providers: [RhetorizabilityStatusService, RhetorizabilityAdminService],
  exports: [RhetorizabilityAdminService],
})
export class RhetorizabilityModule {}
