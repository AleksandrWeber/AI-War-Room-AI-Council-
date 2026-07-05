import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ArchetypizabilityAdminService } from './archetypizability-admin.service.js'
import { ArchetypizabilityController } from './archetypizability.controller.js'
import { ArchetypizabilityStatusService } from './archetypizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ArchetypizabilityController],
  providers: [ArchetypizabilityStatusService, ArchetypizabilityAdminService],
  exports: [ArchetypizabilityAdminService],
})
export class ArchetypizabilityModule {}
