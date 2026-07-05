import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { OptimizabilityAdminService } from './optimizability-admin.service.js'
import { OptimizabilityController } from './optimizability.controller.js'
import { OptimizabilityStatusService } from './optimizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [OptimizabilityController],
  providers: [OptimizabilityStatusService, OptimizabilityAdminService],
  exports: [OptimizabilityAdminService],
})
export class OptimizabilityModule {}
