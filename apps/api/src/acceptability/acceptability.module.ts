import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AcceptabilityAdminService } from './acceptability-admin.service.js'
import { AcceptabilityController } from './acceptability.controller.js'
import { AcceptabilityStatusService } from './acceptability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AcceptabilityController],
  providers: [AcceptabilityStatusService, AcceptabilityAdminService],
  exports: [AcceptabilityAdminService],
})
export class AcceptabilityModule {}
