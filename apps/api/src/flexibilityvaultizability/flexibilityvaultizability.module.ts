import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { FlexibilityvaultizabilityAdminService } from './flexibilityvaultizability-admin.service.js'
import { FlexibilityvaultizabilityController } from './flexibilityvaultizability.controller.js'
import { FlexibilityvaultizabilityStatusService } from './flexibilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [FlexibilityvaultizabilityController],
  providers: [FlexibilityvaultizabilityStatusService, FlexibilityvaultizabilityAdminService],
  exports: [FlexibilityvaultizabilityAdminService],
})
export class FlexibilityvaultizabilityModule {}
