import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EffectivenessAdminService } from './effectiveness-admin.service.js'
import { EffectivenessController } from './effectiveness.controller.js'
import { EffectivenessStatusService } from './effectiveness-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EffectivenessController],
  providers: [EffectivenessStatusService, EffectivenessAdminService],
  exports: [EffectivenessAdminService],
})
export class EffectivenessModule {}
