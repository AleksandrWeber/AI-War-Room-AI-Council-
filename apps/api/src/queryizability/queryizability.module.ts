import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { QueryizabilityAdminService } from './queryizability-admin.service.js'
import { QueryizabilityController } from './queryizability.controller.js'
import { QueryizabilityStatusService } from './queryizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [QueryizabilityController],
  providers: [QueryizabilityStatusService, QueryizabilityAdminService],
  exports: [QueryizabilityAdminService],
})
export class QueryizabilityModule {}
