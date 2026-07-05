import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MonitorizabilityAdminService } from './monitorizability-admin.service.js'
import { MonitorizabilityController } from './monitorizability.controller.js'
import { MonitorizabilityStatusService } from './monitorizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MonitorizabilityController],
  providers: [MonitorizabilityStatusService, MonitorizabilityAdminService],
  exports: [MonitorizabilityAdminService],
})
export class MonitorizabilityModule {}
