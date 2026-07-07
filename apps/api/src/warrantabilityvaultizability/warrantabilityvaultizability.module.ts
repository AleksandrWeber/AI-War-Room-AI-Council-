import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { WarrantabilityvaultizabilityAdminService } from './warrantabilityvaultizability-admin.service.js'
import { WarrantabilityvaultizabilityController } from './warrantabilityvaultizability.controller.js'
import { WarrantabilityvaultizabilityStatusService } from './warrantabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [WarrantabilityvaultizabilityController],
  providers: [WarrantabilityvaultizabilityStatusService, WarrantabilityvaultizabilityAdminService],
  exports: [WarrantabilityvaultizabilityAdminService],
})
export class WarrantabilityvaultizabilityModule {}
