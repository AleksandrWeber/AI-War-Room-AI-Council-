import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { HermeneutizabilityAdminService } from './hermeneutizability-admin.service.js'
import { HermeneutizabilityController } from './hermeneutizability.controller.js'
import { HermeneutizabilityStatusService } from './hermeneutizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [HermeneutizabilityController],
  providers: [HermeneutizabilityStatusService, HermeneutizabilityAdminService],
  exports: [HermeneutizabilityAdminService],
})
export class HermeneutizabilityModule {}
