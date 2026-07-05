import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NcompactionizabilityAdminService } from './ncompactionizability-admin.service.js'
import { NcompactionizabilityController } from './ncompactionizability.controller.js'
import { NcompactionizabilityStatusService } from './ncompactionizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NcompactionizabilityController],
  providers: [NcompactionizabilityStatusService, NcompactionizabilityAdminService],
  exports: [NcompactionizabilityAdminService],
})
export class NcompactionizabilityModule {}
