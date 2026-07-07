import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { LocatabilityvaultizabilityAdminService } from './locatabilityvaultizability-admin.service.js'
import { LocatabilityvaultizabilityController } from './locatabilityvaultizability.controller.js'
import { LocatabilityvaultizabilityStatusService } from './locatabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [LocatabilityvaultizabilityController],
  providers: [LocatabilityvaultizabilityStatusService, LocatabilityvaultizabilityAdminService],
  exports: [LocatabilityvaultizabilityAdminService],
})
export class LocatabilityvaultizabilityModule {}
