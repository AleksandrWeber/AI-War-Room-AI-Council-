import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AttestationizabilityAdminService } from './attestationizability-admin.service.js'
import { AttestationizabilityController } from './attestationizability.controller.js'
import { AttestationizabilityStatusService } from './attestationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AttestationizabilityController],
  providers: [AttestationizabilityStatusService, AttestationizabilityAdminService],
  exports: [AttestationizabilityAdminService],
})
export class AttestationizabilityModule {}
