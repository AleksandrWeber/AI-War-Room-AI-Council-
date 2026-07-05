import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DefinizabilityAdminService } from './definizability-admin.service.js'
import { DefinizabilityController } from './definizability.controller.js'
import { DefinizabilityStatusService } from './definizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DefinizabilityController],
  providers: [DefinizabilityStatusService, DefinizabilityAdminService],
  exports: [DefinizabilityAdminService],
})
export class DefinizabilityModule {}
