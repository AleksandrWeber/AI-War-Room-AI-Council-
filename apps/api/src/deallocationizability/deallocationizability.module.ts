import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DeallocationizabilityAdminService } from './deallocationizability-admin.service.js'
import { DeallocationizabilityController } from './deallocationizability.controller.js'
import { DeallocationizabilityStatusService } from './deallocationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DeallocationizabilityController],
  providers: [DeallocationizabilityStatusService, DeallocationizabilityAdminService],
  exports: [DeallocationizabilityAdminService],
})
export class DeallocationizabilityModule {}
