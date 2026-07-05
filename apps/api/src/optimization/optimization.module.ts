import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { OptimizationAdminService } from './optimization-admin.service.js'
import { OptimizationController } from './optimization.controller.js'
import { OptimizationStatusService } from './optimization-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [OptimizationController],
  providers: [OptimizationStatusService, OptimizationAdminService],
  exports: [OptimizationAdminService],
})
export class OptimizationModule {}
