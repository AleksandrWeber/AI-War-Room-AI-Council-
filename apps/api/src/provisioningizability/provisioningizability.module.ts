import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ProvisioningizabilityAdminService } from './provisioningizability-admin.service.js'
import { ProvisioningizabilityController } from './provisioningizability.controller.js'
import { ProvisioningizabilityStatusService } from './provisioningizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ProvisioningizabilityController],
  providers: [ProvisioningizabilityStatusService, ProvisioningizabilityAdminService],
  exports: [ProvisioningizabilityAdminService],
})
export class ProvisioningizabilityModule {}
