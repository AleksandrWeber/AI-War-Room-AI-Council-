import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReproducibilityvaultizabilityAdminService } from './reproducibilityvaultizability-admin.service.js'
import { ReproducibilityvaultizabilityController } from './reproducibilityvaultizability.controller.js'
import { ReproducibilityvaultizabilityStatusService } from './reproducibilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReproducibilityvaultizabilityController],
  providers: [ReproducibilityvaultizabilityStatusService, ReproducibilityvaultizabilityAdminService],
  exports: [ReproducibilityvaultizabilityAdminService],
})
export class ReproducibilityvaultizabilityModule {}
