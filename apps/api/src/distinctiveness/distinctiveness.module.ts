import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DistinctivenessAdminService } from './distinctiveness-admin.service.js'
import { DistinctivenessController } from './distinctiveness.controller.js'
import { DistinctivenessStatusService } from './distinctiveness-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DistinctivenessController],
  providers: [DistinctivenessStatusService, DistinctivenessAdminService],
  exports: [DistinctivenessAdminService],
})
export class DistinctivenessModule {}
