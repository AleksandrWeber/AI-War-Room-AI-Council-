import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AckizabilityAdminService } from './ackizability-admin.service.js'
import { AckizabilityController } from './ackizability.controller.js'
import { AckizabilityStatusService } from './ackizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AckizabilityController],
  providers: [AckizabilityStatusService, AckizabilityAdminService],
  exports: [AckizabilityAdminService],
})
export class AckizabilityModule {}
