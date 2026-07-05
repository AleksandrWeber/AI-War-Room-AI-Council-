import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AllegorizabilityAdminService } from './allegorizability-admin.service.js'
import { AllegorizabilityController } from './allegorizability.controller.js'
import { AllegorizabilityStatusService } from './allegorizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AllegorizabilityController],
  providers: [AllegorizabilityStatusService, AllegorizabilityAdminService],
  exports: [AllegorizabilityAdminService],
})
export class AllegorizabilityModule {}
