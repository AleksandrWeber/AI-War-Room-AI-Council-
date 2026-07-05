import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TaxonomizabilityAdminService } from './taxonomizability-admin.service.js'
import { TaxonomizabilityController } from './taxonomizability.controller.js'
import { TaxonomizabilityStatusService } from './taxonomizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TaxonomizabilityController],
  providers: [TaxonomizabilityStatusService, TaxonomizabilityAdminService],
  exports: [TaxonomizabilityAdminService],
})
export class TaxonomizabilityModule {}
