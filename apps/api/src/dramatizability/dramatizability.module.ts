import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DramatizabilityAdminService } from './dramatizability-admin.service.js'
import { DramatizabilityController } from './dramatizability.controller.js'
import { DramatizabilityStatusService } from './dramatizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DramatizabilityController],
  providers: [DramatizabilityStatusService, DramatizabilityAdminService],
  exports: [DramatizabilityAdminService],
})
export class DramatizabilityModule {}
