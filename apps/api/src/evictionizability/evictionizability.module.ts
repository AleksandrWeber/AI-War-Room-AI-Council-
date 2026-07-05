import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EvictionizabilityAdminService } from './evictionizability-admin.service.js'
import { EvictionizabilityController } from './evictionizability.controller.js'
import { EvictionizabilityStatusService } from './evictionizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EvictionizabilityController],
  providers: [EvictionizabilityStatusService, EvictionizabilityAdminService],
  exports: [EvictionizabilityAdminService],
})
export class EvictionizabilityModule {}
