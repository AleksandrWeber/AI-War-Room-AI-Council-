import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SignifiabilityAdminService } from './signifiability-admin.service.js'
import { SignifiabilityController } from './signifiability.controller.js'
import { SignifiabilityStatusService } from './signifiability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SignifiabilityController],
  providers: [SignifiabilityStatusService, SignifiabilityAdminService],
  exports: [SignifiabilityAdminService],
})
export class SignifiabilityModule {}
