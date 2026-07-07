import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TransparencyizabilityAdminService } from './transparencyizability-admin.service.js'
import { TransparencyizabilityController } from './transparencyizability.controller.js'
import { TransparencyizabilityStatusService } from './transparencyizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TransparencyizabilityController],
  providers: [TransparencyizabilityStatusService, TransparencyizabilityAdminService],
  exports: [TransparencyizabilityAdminService],
})
export class TransparencyizabilityModule {}
