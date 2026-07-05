import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { WarrantabilityAdminService } from './warrantability-admin.service.js'
import { WarrantabilityController } from './warrantability.controller.js'
import { WarrantabilityStatusService } from './warrantability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [WarrantabilityController],
  providers: [WarrantabilityStatusService, WarrantabilityAdminService],
  exports: [WarrantabilityAdminService],
})
export class WarrantabilityModule {}
