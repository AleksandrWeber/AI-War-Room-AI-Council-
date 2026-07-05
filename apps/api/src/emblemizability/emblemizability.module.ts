import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EmblemizabilityAdminService } from './emblemizability-admin.service.js'
import { EmblemizabilityController } from './emblemizability.controller.js'
import { EmblemizabilityStatusService } from './emblemizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EmblemizabilityController],
  providers: [EmblemizabilityStatusService, EmblemizabilityAdminService],
  exports: [EmblemizabilityAdminService],
})
export class EmblemizabilityModule {}
