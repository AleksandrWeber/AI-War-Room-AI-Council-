import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TypifiabilityAdminService } from './typifiability-admin.service.js'
import { TypifiabilityController } from './typifiability.controller.js'
import { TypifiabilityStatusService } from './typifiability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TypifiabilityController],
  providers: [TypifiabilityStatusService, TypifiabilityAdminService],
  exports: [TypifiabilityAdminService],
})
export class TypifiabilityModule {}
