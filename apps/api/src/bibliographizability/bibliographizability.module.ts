import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { BibliographizabilityAdminService } from './bibliographizability-admin.service.js'
import { BibliographizabilityController } from './bibliographizability.controller.js'
import { BibliographizabilityStatusService } from './bibliographizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [BibliographizabilityController],
  providers: [BibliographizabilityStatusService, BibliographizabilityAdminService],
  exports: [BibliographizabilityAdminService],
})
export class BibliographizabilityModule {}
