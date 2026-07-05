import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SemanticizabilityAdminService } from './semanticizability-admin.service.js'
import { SemanticizabilityController } from './semanticizability.controller.js'
import { SemanticizabilityStatusService } from './semanticizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SemanticizabilityController],
  providers: [SemanticizabilityStatusService, SemanticizabilityAdminService],
  exports: [SemanticizabilityAdminService],
})
export class SemanticizabilityModule {}
