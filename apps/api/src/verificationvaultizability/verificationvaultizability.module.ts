import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { VerificationvaultizabilityAdminService } from './verificationvaultizability-admin.service.js'
import { VerificationvaultizabilityController } from './verificationvaultizability.controller.js'
import { VerificationvaultizabilityStatusService } from './verificationvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [VerificationvaultizabilityController],
  providers: [VerificationvaultizabilityStatusService, VerificationvaultizabilityAdminService],
  exports: [VerificationvaultizabilityAdminService],
})
export class VerificationvaultizabilityModule {}
