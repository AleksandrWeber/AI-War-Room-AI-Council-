import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InductizabilityAdminService } from './inductizability-admin.service.js'
import { InductizabilityController } from './inductizability.controller.js'
import { InductizabilityStatusService } from './inductizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [InductizabilityController],
  providers: [InductizabilityStatusService, InductizabilityAdminService],
  exports: [InductizabilityAdminService],
})
export class InductizabilityModule {}
