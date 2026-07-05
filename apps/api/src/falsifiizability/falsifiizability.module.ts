import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { FalsifiizabilityAdminService } from './falsifiizability-admin.service.js'
import { FalsifiizabilityController } from './falsifiizability.controller.js'
import { FalsifiizabilityStatusService } from './falsifiizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [FalsifiizabilityController],
  providers: [FalsifiizabilityStatusService, FalsifiizabilityAdminService],
  exports: [FalsifiizabilityAdminService],
})
export class FalsifiizabilityModule {}
