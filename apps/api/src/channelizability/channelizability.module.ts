import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ChannelizabilityAdminService } from './channelizability-admin.service.js'
import { ChannelizabilityController } from './channelizability.controller.js'
import { ChannelizabilityStatusService } from './channelizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ChannelizabilityController],
  providers: [ChannelizabilityStatusService, ChannelizabilityAdminService],
  exports: [ChannelizabilityAdminService],
})
export class ChannelizabilityModule {}
