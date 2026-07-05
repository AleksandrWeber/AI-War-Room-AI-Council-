import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AvailabilizabilityAdminService } from './availabilizability-admin.service.js'
import { AvailabilizabilityController } from './availabilizability.controller.js'
import { AvailabilizabilityStatusService } from './availabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AvailabilizabilityController],
  providers: [AvailabilizabilityStatusService, AvailabilizabilityAdminService],
  exports: [AvailabilizabilityAdminService],
})
export class AvailabilizabilityModule {}
