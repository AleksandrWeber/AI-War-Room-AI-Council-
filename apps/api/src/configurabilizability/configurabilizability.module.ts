import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConfigurabilizabilityAdminService } from './configurabilizability-admin.service.js'
import { ConfigurabilizabilityController } from './configurabilizability.controller.js'
import { ConfigurabilizabilityStatusService } from './configurabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConfigurabilizabilityController],
  providers: [ConfigurabilizabilityStatusService, ConfigurabilizabilityAdminService],
  exports: [ConfigurabilizabilityAdminService],
})
export class ConfigurabilizabilityModule {}
