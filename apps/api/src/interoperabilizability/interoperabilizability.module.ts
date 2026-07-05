import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InteroperabilizabilityAdminService } from './interoperabilizability-admin.service.js'
import { InteroperabilizabilityController } from './interoperabilizability.controller.js'
import { InteroperabilizabilityStatusService } from './interoperabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [InteroperabilizabilityController],
  providers: [InteroperabilizabilityStatusService, InteroperabilizabilityAdminService],
  exports: [InteroperabilizabilityAdminService],
})
export class InteroperabilizabilityModule {}
