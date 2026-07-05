import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { HealthModule } from '../health/health.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DeploymentAdminService } from './deployment-admin.service.js'
import { DeploymentController } from './deployment.controller.js'

@Module({
  imports: [HealthModule, forwardRef(() => AuthModule), WorkspacesModule],
  controllers: [DeploymentController],
  providers: [DeploymentAdminService],
  exports: [DeploymentAdminService],
})
export class DeploymentModule {}
