import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { BluegreenizabilityAdminService } from './bluegreenizability-admin.service.js'
import { BluegreenizabilityController } from './bluegreenizability.controller.js'
import { BluegreenizabilityStatusService } from './bluegreenizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [BluegreenizabilityController],
  providers: [BluegreenizabilityStatusService, BluegreenizabilityAdminService],
  exports: [BluegreenizabilityAdminService],
})
export class BluegreenizabilityModule {}
