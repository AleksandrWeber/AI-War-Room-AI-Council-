import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AffordabilityAdminService } from './affordability-admin.service.js'
import { AffordabilityController } from './affordability.controller.js'
import { AffordabilityStatusService } from './affordability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AffordabilityController],
  providers: [AffordabilityStatusService, AffordabilityAdminService],
  exports: [AffordabilityAdminService],
})
export class AffordabilityModule {}
