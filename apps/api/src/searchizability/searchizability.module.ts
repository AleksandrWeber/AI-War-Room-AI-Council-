import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SearchizabilityAdminService } from './searchizability-admin.service.js'
import { SearchizabilityController } from './searchizability.controller.js'
import { SearchizabilityStatusService } from './searchizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SearchizabilityController],
  providers: [SearchizabilityStatusService, SearchizabilityAdminService],
  exports: [SearchizabilityAdminService],
})
export class SearchizabilityModule {}
