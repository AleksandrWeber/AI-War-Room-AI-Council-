import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TrustworthinessvaultizabilityAdminService } from './trustworthinessvaultizability-admin.service.js'
import { TrustworthinessvaultizabilityController } from './trustworthinessvaultizability.controller.js'
import { TrustworthinessvaultizabilityStatusService } from './trustworthinessvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TrustworthinessvaultizabilityController],
  providers: [TrustworthinessvaultizabilityStatusService, TrustworthinessvaultizabilityAdminService],
  exports: [TrustworthinessvaultizabilityAdminService],
})
export class TrustworthinessvaultizabilityModule {}
