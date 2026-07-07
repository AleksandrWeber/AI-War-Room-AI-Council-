import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CustomizabilityvaultizabilityAdminService } from './customizabilityvaultizability-admin.service.js'
import { CustomizabilityvaultizabilityController } from './customizabilityvaultizability.controller.js'
import { CustomizabilityvaultizabilityStatusService } from './customizabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CustomizabilityvaultizabilityController],
  providers: [CustomizabilityvaultizabilityStatusService, CustomizabilityvaultizabilityAdminService],
  exports: [CustomizabilityvaultizabilityAdminService],
})
export class CustomizabilityvaultizabilityModule {}
