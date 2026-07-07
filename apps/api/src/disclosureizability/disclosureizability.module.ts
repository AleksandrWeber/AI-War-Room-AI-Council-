import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DisclosureizabilityAdminService } from './disclosureizability-admin.service.js'
import { DisclosureizabilityController } from './disclosureizability.controller.js'
import { DisclosureizabilityStatusService } from './disclosureizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DisclosureizabilityController],
  providers: [DisclosureizabilityStatusService, DisclosureizabilityAdminService],
  exports: [DisclosureizabilityAdminService],
})
export class DisclosureizabilityModule {}
