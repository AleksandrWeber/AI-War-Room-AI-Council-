import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { UnderstandabilityAdminService } from './understandability-admin.service.js'
import { UnderstandabilityController } from './understandability.controller.js'
import { UnderstandabilityStatusService } from './understandability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [UnderstandabilityController],
  providers: [UnderstandabilityStatusService, UnderstandabilityAdminService],
  exports: [UnderstandabilityAdminService],
})
export class UnderstandabilityModule {}
