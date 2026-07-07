import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AuditvaultizabilityAdminService } from './auditvaultizability-admin.service.js'
import { AuditvaultizabilityController } from './auditvaultizability.controller.js'
import { AuditvaultizabilityStatusService } from './auditvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AuditvaultizabilityController],
  providers: [AuditvaultizabilityStatusService, AuditvaultizabilityAdminService],
  exports: [AuditvaultizabilityAdminService],
})
export class AuditvaultizabilityModule {}
