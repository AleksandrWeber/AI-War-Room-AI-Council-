import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TrustworthinessAdminService } from './trustworthiness-admin.service.js'
import { TrustworthinessController } from './trustworthiness.controller.js'
import { TrustworthinessStatusService } from './trustworthiness-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TrustworthinessController],
  providers: [TrustworthinessStatusService, TrustworthinessAdminService],
  exports: [TrustworthinessAdminService],
})
export class TrustworthinessModule {}
