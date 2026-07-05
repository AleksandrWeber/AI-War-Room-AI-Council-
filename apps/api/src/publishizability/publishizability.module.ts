import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PublishizabilityAdminService } from './publishizability-admin.service.js'
import { PublishizabilityController } from './publishizability.controller.js'
import { PublishizabilityStatusService } from './publishizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PublishizabilityController],
  providers: [PublishizabilityStatusService, PublishizabilityAdminService],
  exports: [PublishizabilityAdminService],
})
export class PublishizabilityModule {}
