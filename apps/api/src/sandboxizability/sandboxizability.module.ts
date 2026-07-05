import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SandboxizabilityAdminService } from './sandboxizability-admin.service.js'
import { SandboxizabilityController } from './sandboxizability.controller.js'
import { SandboxizabilityStatusService } from './sandboxizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SandboxizabilityController],
  providers: [SandboxizabilityStatusService, SandboxizabilityAdminService],
  exports: [SandboxizabilityAdminService],
})
export class SandboxizabilityModule {}
