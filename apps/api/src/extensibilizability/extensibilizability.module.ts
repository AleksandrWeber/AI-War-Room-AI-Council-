import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ExtensibilizabilityAdminService } from './extensibilizability-admin.service.js'
import { ExtensibilizabilityController } from './extensibilizability.controller.js'
import { ExtensibilizabilityStatusService } from './extensibilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ExtensibilizabilityController],
  providers: [ExtensibilizabilityStatusService, ExtensibilizabilityAdminService],
  exports: [ExtensibilizabilityAdminService],
})
export class ExtensibilizabilityModule {}
