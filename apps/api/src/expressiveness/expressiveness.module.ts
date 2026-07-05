import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ExpressivenessAdminService } from './expressiveness-admin.service.js'
import { ExpressivenessController } from './expressiveness.controller.js'
import { ExpressivenessStatusService } from './expressiveness-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ExpressivenessController],
  providers: [ExpressivenessStatusService, ExpressivenessAdminService],
  exports: [ExpressivenessAdminService],
})
export class ExpressivenessModule {}
