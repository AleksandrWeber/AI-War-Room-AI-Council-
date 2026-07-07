import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DisclosureproofizabilityAdminService } from './disclosureproofizability-admin.service.js'
import { DisclosureproofizabilityController } from './disclosureproofizability.controller.js'
import { DisclosureproofizabilityStatusService } from './disclosureproofizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DisclosureproofizabilityController],
  providers: [DisclosureproofizabilityStatusService, DisclosureproofizabilityAdminService],
  exports: [DisclosureproofizabilityAdminService],
})
export class DisclosureproofizabilityModule {}
