import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DecentralizabilityAdminService } from './decentralizability-admin.service.js'
import { DecentralizabilityController } from './decentralizability.controller.js'
import { DecentralizabilityStatusService } from './decentralizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DecentralizabilityController],
  providers: [DecentralizabilityStatusService, DecentralizabilityAdminService],
  exports: [DecentralizabilityAdminService],
})
export class DecentralizabilityModule {}
