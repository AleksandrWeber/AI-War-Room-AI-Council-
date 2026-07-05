import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { UnicastizabilityAdminService } from './unicastizability-admin.service.js'
import { UnicastizabilityController } from './unicastizability.controller.js'
import { UnicastizabilityStatusService } from './unicastizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [UnicastizabilityController],
  providers: [UnicastizabilityStatusService, UnicastizabilityAdminService],
  exports: [UnicastizabilityAdminService],
})
export class UnicastizabilityModule {}
