import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CatalogizabilityAdminService } from './catalogizability-admin.service.js'
import { CatalogizabilityController } from './catalogizability.controller.js'
import { CatalogizabilityStatusService } from './catalogizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CatalogizabilityController],
  providers: [CatalogizabilityStatusService, CatalogizabilityAdminService],
  exports: [CatalogizabilityAdminService],
})
export class CatalogizabilityModule {}
