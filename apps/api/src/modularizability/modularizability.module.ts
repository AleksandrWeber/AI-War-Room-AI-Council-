import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ModularizabilityAdminService } from './modularizability-admin.service.js'
import { ModularizabilityController } from './modularizability.controller.js'
import { ModularizabilityStatusService } from './modularizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ModularizabilityController],
  providers: [ModularizabilityStatusService, ModularizabilityAdminService],
  exports: [ModularizabilityAdminService],
})
export class ModularizabilityModule {}
