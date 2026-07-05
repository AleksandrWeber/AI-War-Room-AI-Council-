import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { OversightAdminService } from './oversight-admin.service.js'
import { OversightController } from './oversight.controller.js'
import { OversightStatusService } from './oversight-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [OversightController],
  providers: [OversightStatusService, OversightAdminService],
  exports: [OversightAdminService],
})
export class OversightModule {}
