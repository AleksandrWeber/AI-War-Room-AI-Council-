import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { VerifiabilityAdminService } from './verifiability-admin.service.js'
import { VerifiabilityController } from './verifiability.controller.js'
import { VerifiabilityStatusService } from './verifiability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [VerifiabilityController],
  providers: [VerifiabilityStatusService, VerifiabilityAdminService],
  exports: [VerifiabilityAdminService],
})
export class VerifiabilityModule {}
