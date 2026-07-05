import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { JustifiabilityAdminService } from './justifiability-admin.service.js'
import { JustifiabilityController } from './justifiability.controller.js'
import { JustifiabilityStatusService } from './justifiability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [JustifiabilityController],
  providers: [JustifiabilityStatusService, JustifiabilityAdminService],
  exports: [JustifiabilityAdminService],
})
export class JustifiabilityModule {}
