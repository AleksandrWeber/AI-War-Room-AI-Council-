import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { GnoseizabilityAdminService } from './gnoseizability-admin.service.js'
import { GnoseizabilityController } from './gnoseizability.controller.js'
import { GnoseizabilityStatusService } from './gnoseizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [GnoseizabilityController],
  providers: [GnoseizabilityStatusService, GnoseizabilityAdminService],
  exports: [GnoseizabilityAdminService],
})
export class GnoseizabilityModule {}
