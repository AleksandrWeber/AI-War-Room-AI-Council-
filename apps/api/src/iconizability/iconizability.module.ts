import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IconizabilityAdminService } from './iconizability-admin.service.js'
import { IconizabilityController } from './iconizability.controller.js'
import { IconizabilityStatusService } from './iconizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IconizabilityController],
  providers: [IconizabilityStatusService, IconizabilityAdminService],
  exports: [IconizabilityAdminService],
})
export class IconizabilityModule {}
