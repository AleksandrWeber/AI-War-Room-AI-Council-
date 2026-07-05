import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AttestationAdminService } from './attestation-admin.service.js'
import { AttestationController } from './attestation.controller.js'
import { AttestationStatusService } from './attestation-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AttestationController],
  providers: [AttestationStatusService, AttestationAdminService],
  exports: [AttestationAdminService],
})
export class AttestationModule {}
