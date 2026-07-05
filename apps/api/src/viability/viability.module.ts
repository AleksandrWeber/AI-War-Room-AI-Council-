import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ViabilityAdminService } from './viability-admin.service.js'
import { ViabilityController } from './viability.controller.js'
import { ViabilityStatusService } from './viability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ViabilityController],
  providers: [ViabilityStatusService, ViabilityAdminService],
  exports: [ViabilityAdminService],
})
export class ViabilityModule {}
