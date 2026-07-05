import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { OrdinarizabilityAdminService } from './ordinarizability-admin.service.js'
import { OrdinarizabilityController } from './ordinarizability.controller.js'
import { OrdinarizabilityStatusService } from './ordinarizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [OrdinarizabilityController],
  providers: [OrdinarizabilityStatusService, OrdinarizabilityAdminService],
  exports: [OrdinarizabilityAdminService],
})
export class OrdinarizabilityModule {}
