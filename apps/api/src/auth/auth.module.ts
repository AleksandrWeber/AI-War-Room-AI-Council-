import { Module } from '@nestjs/common'
import { WorkspaceAccessGuard } from './workspace-access.guard.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'

@Module({
  imports: [WorkspacesModule],
  providers: [WorkspaceAccessGuard],
  exports: [WorkspaceAccessGuard],
})
export class AuthModule {}
