import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SignatureproofizabilityAdminService } from './signatureproofizability-admin.service.js'
import { SignatureproofizabilityController } from './signatureproofizability.controller.js'
import { SignatureproofizabilityStatusService } from './signatureproofizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SignatureproofizabilityController],
  providers: [SignatureproofizabilityStatusService, SignatureproofizabilityAdminService],
  exports: [SignatureproofizabilityAdminService],
})
export class SignatureproofizabilityModule {}
