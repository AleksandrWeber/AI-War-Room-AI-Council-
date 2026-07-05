import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SubstantiabilityAdminService } from './substantiability-admin.service.js'
import { SubstantiabilityController } from './substantiability.controller.js'
import { SubstantiabilityStatusService } from './substantiability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SubstantiabilityController],
  providers: [SubstantiabilityStatusService, SubstantiabilityAdminService],
  exports: [SubstantiabilityAdminService],
})
export class SubstantiabilityModule {}
