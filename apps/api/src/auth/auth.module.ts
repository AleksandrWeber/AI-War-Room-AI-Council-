import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { WorkspaceAccessGuard } from './workspace-access.guard.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'

@Module({
  imports: [WorkspacesModule],
  controllers: [AuthController],
  providers: [AuthService, WorkspaceAccessGuard],
  exports: [AuthService, WorkspaceAccessGuard],
})
export class AuthModule {}
