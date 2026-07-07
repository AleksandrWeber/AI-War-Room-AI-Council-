import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IntegrityjournalizabilityAdminService } from './integrityjournalizability-admin.service.js'
import { IntegrityjournalizabilityController } from './integrityjournalizability.controller.js'
import { IntegrityjournalizabilityStatusService } from './integrityjournalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IntegrityjournalizabilityController],
  providers: [IntegrityjournalizabilityStatusService, IntegrityjournalizabilityAdminService],
  exports: [IntegrityjournalizabilityAdminService],
})
export class IntegrityjournalizabilityModule {}
