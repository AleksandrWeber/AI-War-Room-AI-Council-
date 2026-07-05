import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MythicizabilityAdminService } from './mythicizability-admin.service.js'
import { MythicizabilityController } from './mythicizability.controller.js'
import { MythicizabilityStatusService } from './mythicizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MythicizabilityController],
  providers: [MythicizabilityStatusService, MythicizabilityAdminService],
  exports: [MythicizabilityAdminService],
})
export class MythicizabilityModule {}
