import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ColdizabilityAdminService } from './coldizability-admin.service.js'
import { ColdizabilityController } from './coldizability.controller.js'
import { ColdizabilityStatusService } from './coldizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ColdizabilityController],
  providers: [ColdizabilityStatusService, ColdizabilityAdminService],
  exports: [ColdizabilityAdminService],
})
export class ColdizabilityModule {}
