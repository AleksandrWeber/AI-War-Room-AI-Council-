import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MorphizabilityAdminService } from './morphizability-admin.service.js'
import { MorphizabilityController } from './morphizability.controller.js'
import { MorphizabilityStatusService } from './morphizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MorphizabilityController],
  providers: [MorphizabilityStatusService, MorphizabilityAdminService],
  exports: [MorphizabilityAdminService],
})
export class MorphizabilityModule {}
