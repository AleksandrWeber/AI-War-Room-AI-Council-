import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PersonifiabilityAdminService } from './personifiability-admin.service.js'
import { PersonifiabilityController } from './personifiability.controller.js'
import { PersonifiabilityStatusService } from './personifiability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PersonifiabilityController],
  providers: [PersonifiabilityStatusService, PersonifiabilityAdminService],
  exports: [PersonifiabilityAdminService],
})
export class PersonifiabilityModule {}
