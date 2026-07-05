import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TransformizabilityAdminService } from './transformizability-admin.service.js'
import { TransformizabilityController } from './transformizability.controller.js'
import { TransformizabilityStatusService } from './transformizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TransformizabilityController],
  providers: [TransformizabilityStatusService, TransformizabilityAdminService],
  exports: [TransformizabilityAdminService],
})
export class TransformizabilityModule {}
