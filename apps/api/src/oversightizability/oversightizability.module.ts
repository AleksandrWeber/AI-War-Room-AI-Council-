import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { OversightizabilityAdminService } from './oversightizability-admin.service.js'
import { OversightizabilityController } from './oversightizability.controller.js'
import { OversightizabilityStatusService } from './oversightizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [OversightizabilityController],
  providers: [OversightizabilityStatusService, OversightizabilityAdminService],
  exports: [OversightizabilityAdminService],
})
export class OversightizabilityModule {}
