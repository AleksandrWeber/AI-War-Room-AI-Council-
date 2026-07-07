import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AttestationvaultizabilityAdminService } from './attestationvaultizability-admin.service.js'
import { AttestationvaultizabilityController } from './attestationvaultizability.controller.js'
import { AttestationvaultizabilityStatusService } from './attestationvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AttestationvaultizabilityController],
  providers: [AttestationvaultizabilityStatusService, AttestationvaultizabilityAdminService],
  exports: [AttestationvaultizabilityAdminService],
})
export class AttestationvaultizabilityModule {}
