import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CustomizabilityAdminService } from './customizability-admin.service.js'
import { CustomizabilityController } from './customizability.controller.js'
import { CustomizabilityStatusService } from './customizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CustomizabilityController],
  providers: [CustomizabilityStatusService, CustomizabilityAdminService],
  exports: [CustomizabilityAdminService],
})
export class CustomizabilityModule {}
