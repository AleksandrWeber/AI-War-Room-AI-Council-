import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ThesaurusizabilityAdminService } from './thesaurusizability-admin.service.js'
import { ThesaurusizabilityController } from './thesaurusizability.controller.js'
import { ThesaurusizabilityStatusService } from './thesaurusizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ThesaurusizabilityController],
  providers: [ThesaurusizabilityStatusService, ThesaurusizabilityAdminService],
  exports: [ThesaurusizabilityAdminService],
})
export class ThesaurusizabilityModule {}
