import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SyntacticizabilityAdminService } from './syntacticizability-admin.service.js'
import { SyntacticizabilityController } from './syntacticizability.controller.js'
import { SyntacticizabilityStatusService } from './syntacticizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SyntacticizabilityController],
  providers: [SyntacticizabilityStatusService, SyntacticizabilityAdminService],
  exports: [SyntacticizabilityAdminService],
})
export class SyntacticizabilityModule {}
