import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IsolatizabilityAdminService } from './isolatizability-admin.service.js'
import { IsolatizabilityController } from './isolatizability.controller.js'
import { IsolatizabilityStatusService } from './isolatizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IsolatizabilityController],
  providers: [IsolatizabilityStatusService, IsolatizabilityAdminService],
  exports: [IsolatizabilityAdminService],
})
export class IsolatizabilityModule {}
