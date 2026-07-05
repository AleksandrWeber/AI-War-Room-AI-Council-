import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { MigrationsModule } from '../migrations/migrations.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { StabilityAdminService } from './stability-admin.service.js'
import { StabilityController } from './stability.controller.js'
import { StabilityStatusService } from './stability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    MigrationsModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [StabilityController],
  providers: [StabilityStatusService, StabilityAdminService],
  exports: [StabilityAdminService],
})
export class StabilityModule {}
