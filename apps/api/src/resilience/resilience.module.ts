import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { MigrationsModule } from '../migrations/migrations.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ResilienceAdminService } from './resilience-admin.service.js'
import { ResilienceController } from './resilience.controller.js'
import { ResilienceStatusService } from './resilience-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    MigrationsModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ResilienceController],
  providers: [ResilienceStatusService, ResilienceAdminService],
  exports: [ResilienceAdminService],
})
export class ResilienceModule {}
