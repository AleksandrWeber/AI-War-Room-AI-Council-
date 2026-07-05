import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InterfabilizabilityAdminService } from './interfabilizability-admin.service.js'
import { InterfabilizabilityController } from './interfabilizability.controller.js'
import { InterfabilizabilityStatusService } from './interfabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [InterfabilizabilityController],
  providers: [InterfabilizabilityStatusService, InterfabilizabilityAdminService],
  exports: [InterfabilizabilityAdminService],
})
export class InterfabilizabilityModule {}
