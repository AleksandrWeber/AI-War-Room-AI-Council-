import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { FootnotizabilityAdminService } from './footnotizability-admin.service.js'
import { FootnotizabilityController } from './footnotizability.controller.js'
import { FootnotizabilityStatusService } from './footnotizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [FootnotizabilityController],
  providers: [FootnotizabilityStatusService, FootnotizabilityAdminService],
  exports: [FootnotizabilityAdminService],
})
export class FootnotizabilityModule {}
