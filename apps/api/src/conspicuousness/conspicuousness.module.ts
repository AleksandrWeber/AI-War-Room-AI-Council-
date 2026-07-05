import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConspicuousnessAdminService } from './conspicuousness-admin.service.js'
import { ConspicuousnessController } from './conspicuousness.controller.js'
import { ConspicuousnessStatusService } from './conspicuousness-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConspicuousnessController],
  providers: [ConspicuousnessStatusService, ConspicuousnessAdminService],
  exports: [ConspicuousnessAdminService],
})
export class ConspicuousnessModule {}
