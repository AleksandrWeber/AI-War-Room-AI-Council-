import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CodifiabilityAdminService } from './codifiability-admin.service.js'
import { CodifiabilityController } from './codifiability.controller.js'
import { CodifiabilityStatusService } from './codifiability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CodifiabilityController],
  providers: [CodifiabilityStatusService, CodifiabilityAdminService],
  exports: [CodifiabilityAdminService],
})
export class CodifiabilityModule {}
