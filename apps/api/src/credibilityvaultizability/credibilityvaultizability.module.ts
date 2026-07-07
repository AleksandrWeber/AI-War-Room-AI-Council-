import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CredibilityvaultizabilityAdminService } from './credibilityvaultizability-admin.service.js'
import { CredibilityvaultizabilityController } from './credibilityvaultizability.controller.js'
import { CredibilityvaultizabilityStatusService } from './credibilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CredibilityvaultizabilityController],
  providers: [CredibilityvaultizabilityStatusService, CredibilityvaultizabilityAdminService],
  exports: [CredibilityvaultizabilityAdminService],
})
export class CredibilityvaultizabilityModule {}
