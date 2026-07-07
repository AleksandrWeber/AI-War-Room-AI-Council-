import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SubstantiabilityvaultizabilityAdminService } from './substantiabilityvaultizability-admin.service.js'
import { SubstantiabilityvaultizabilityController } from './substantiabilityvaultizability.controller.js'
import { SubstantiabilityvaultizabilityStatusService } from './substantiabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SubstantiabilityvaultizabilityController],
  providers: [SubstantiabilityvaultizabilityStatusService, SubstantiabilityvaultizabilityAdminService],
  exports: [SubstantiabilityvaultizabilityAdminService],
})
export class SubstantiabilityvaultizabilityModule {}
