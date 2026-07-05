import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ClassifiabilityAdminService } from './classifiability-admin.service.js'
import { ClassifiabilityController } from './classifiability.controller.js'
import { ClassifiabilityStatusService } from './classifiability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ClassifiabilityController],
  providers: [ClassifiabilityStatusService, ClassifiabilityAdminService],
  exports: [ClassifiabilityAdminService],
})
export class ClassifiabilityModule {}
