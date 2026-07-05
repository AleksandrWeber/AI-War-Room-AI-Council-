import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { HealthModule } from '../health/health.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AvailabilityAdminService } from './availability-admin.service.js'
import { AvailabilityController } from './availability.controller.js'
import { AvailabilityStatusService } from './availability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    HealthModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityStatusService, AvailabilityAdminService],
  exports: [AvailabilityAdminService],
})
export class AvailabilityModule {}
