import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AttesttrackizabilityAdminService } from './attesttrackizability-admin.service.js'
import { AttesttrackizabilityController } from './attesttrackizability.controller.js'
import { AttesttrackizabilityStatusService } from './attesttrackizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AttesttrackizabilityController],
  providers: [AttesttrackizabilityStatusService, AttesttrackizabilityAdminService],
  exports: [AttesttrackizabilityAdminService],
})
export class AttesttrackizabilityModule {}
