import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ExtensibilityvaultizabilityAdminService } from './extensibilityvaultizability-admin.service.js'
import { ExtensibilityvaultizabilityController } from './extensibilityvaultizability.controller.js'
import { ExtensibilityvaultizabilityStatusService } from './extensibilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ExtensibilityvaultizabilityController],
  providers: [ExtensibilityvaultizabilityStatusService, ExtensibilityvaultizabilityAdminService],
  exports: [ExtensibilityvaultizabilityAdminService],
})
export class ExtensibilityvaultizabilityModule {}
