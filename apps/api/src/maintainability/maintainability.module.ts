import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { HealthModule } from '../health/health.module.js'
import { MigrationsModule } from '../migrations/migrations.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MaintainabilityAdminService } from './maintainability-admin.service.js'
import { MaintainabilityController } from './maintainability.controller.js'
import { MaintainabilityStatusService } from './maintainability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    MigrationsModule,
    HealthModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MaintainabilityController],
  providers: [MaintainabilityStatusService, MaintainabilityAdminService],
  exports: [MaintainabilityAdminService],
})
export class MaintainabilityModule {}
