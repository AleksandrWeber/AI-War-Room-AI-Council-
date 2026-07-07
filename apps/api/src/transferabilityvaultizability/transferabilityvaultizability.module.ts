import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TransferabilityvaultizabilityAdminService } from './transferabilityvaultizability-admin.service.js'
import { TransferabilityvaultizabilityController } from './transferabilityvaultizability.controller.js'
import { TransferabilityvaultizabilityStatusService } from './transferabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TransferabilityvaultizabilityController],
  providers: [TransferabilityvaultizabilityStatusService, TransferabilityvaultizabilityAdminService],
  exports: [TransferabilityvaultizabilityAdminService],
})
export class TransferabilityvaultizabilityModule {}
