import { Module, forwardRef } from '@nestjs/common'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { ExternalAuthService } from './external-auth.service.js'
import { WorkspaceAccessGuard } from './workspace-access.guard.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'

@Module({
  imports: [forwardRef(() => WorkspacesModule)],
  controllers: [AuthController],
  providers: [AuthService, ExternalAuthService, WorkspaceAccessGuard],
  exports: [AuthService, ExternalAuthService, WorkspaceAccessGuard],
})
export class AuthModule {}
