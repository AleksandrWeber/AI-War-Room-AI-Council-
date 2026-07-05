import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DocumentizabilityAdminService } from './documentizability-admin.service.js'
import { DocumentizabilityController } from './documentizability.controller.js'
import { DocumentizabilityStatusService } from './documentizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DocumentizabilityController],
  providers: [DocumentizabilityStatusService, DocumentizabilityAdminService],
  exports: [DocumentizabilityAdminService],
})
export class DocumentizabilityModule {}
