import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EnunciabilityAdminService } from './enunciability-admin.service.js'
import { EnunciabilityController } from './enunciability.controller.js'
import { EnunciabilityStatusService } from './enunciability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EnunciabilityController],
  providers: [EnunciabilityStatusService, EnunciabilityAdminService],
  exports: [EnunciabilityAdminService],
})
export class EnunciabilityModule {}
