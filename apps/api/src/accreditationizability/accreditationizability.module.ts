import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AccreditationizabilityAdminService } from './accreditationizability-admin.service.js'
import { AccreditationizabilityController } from './accreditationizability.controller.js'
import { AccreditationizabilityStatusService } from './accreditationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AccreditationizabilityController],
  providers: [AccreditationizabilityStatusService, AccreditationizabilityAdminService],
  exports: [AccreditationizabilityAdminService],
})
export class AccreditationizabilityModule {}
