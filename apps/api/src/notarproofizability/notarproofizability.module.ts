import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NotarproofizabilityAdminService } from './notarproofizability-admin.service.js'
import { NotarproofizabilityController } from './notarproofizability.controller.js'
import { NotarproofizabilityStatusService } from './notarproofizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NotarproofizabilityController],
  providers: [NotarproofizabilityStatusService, NotarproofizabilityAdminService],
  exports: [NotarproofizabilityAdminService],
})
export class NotarproofizabilityModule {}
