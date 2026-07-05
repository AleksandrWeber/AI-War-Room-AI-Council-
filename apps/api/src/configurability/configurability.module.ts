import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConfigurabilityAdminService } from './configurability-admin.service.js'
import { ConfigurabilityController } from './configurability.controller.js'
import { ConfigurabilityStatusService } from './configurability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConfigurabilityController],
  providers: [ConfigurabilityStatusService, ConfigurabilityAdminService],
  exports: [ConfigurabilityAdminService],
})
export class ConfigurabilityModule {}
