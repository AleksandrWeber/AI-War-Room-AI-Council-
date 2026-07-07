import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { JustifiabilityvaultizabilityAdminService } from './justifiabilityvaultizability-admin.service.js'
import { JustifiabilityvaultizabilityController } from './justifiabilityvaultizability.controller.js'
import { JustifiabilityvaultizabilityStatusService } from './justifiabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [JustifiabilityvaultizabilityController],
  providers: [JustifiabilityvaultizabilityStatusService, JustifiabilityvaultizabilityAdminService],
  exports: [JustifiabilityvaultizabilityAdminService],
})
export class JustifiabilityvaultizabilityModule {}
