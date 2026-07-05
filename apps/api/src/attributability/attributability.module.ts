import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AttributabilityAdminService } from './attributability-admin.service.js'
import { AttributabilityController } from './attributability.controller.js'
import { AttributabilityStatusService } from './attributability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AttributabilityController],
  providers: [AttributabilityStatusService, AttributabilityAdminService],
  exports: [AttributabilityAdminService],
})
export class AttributabilityModule {}
