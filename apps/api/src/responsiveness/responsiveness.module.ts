import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ResponsivenessAdminService } from './responsiveness-admin.service.js'
import { ResponsivenessController } from './responsiveness.controller.js'
import { ResponsivenessStatusService } from './responsiveness-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ResponsivenessController],
  providers: [ResponsivenessStatusService, ResponsivenessAdminService],
  exports: [ResponsivenessAdminService],
})
export class ResponsivenessModule {}
