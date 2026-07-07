import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConfigurabilityvaultizabilityAdminService } from './configurabilityvaultizability-admin.service.js'
import { ConfigurabilityvaultizabilityController } from './configurabilityvaultizability.controller.js'
import { ConfigurabilityvaultizabilityStatusService } from './configurabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConfigurabilityvaultizabilityController],
  providers: [ConfigurabilityvaultizabilityStatusService, ConfigurabilityvaultizabilityAdminService],
  exports: [ConfigurabilityvaultizabilityAdminService],
})
export class ConfigurabilityvaultizabilityModule {}
