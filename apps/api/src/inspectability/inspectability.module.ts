import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InspectabilityAdminService } from './inspectability-admin.service.js'
import { InspectabilityController } from './inspectability.controller.js'
import { InspectabilityStatusService } from './inspectability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [InspectabilityController],
  providers: [InspectabilityStatusService, InspectabilityAdminService],
  exports: [InspectabilityAdminService],
})
export class InspectabilityModule {}
