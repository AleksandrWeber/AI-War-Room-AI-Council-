import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AppropriatenessAdminService } from './appropriateness-admin.service.js'
import { AppropriatenessController } from './appropriateness.controller.js'
import { AppropriatenessStatusService } from './appropriateness-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AppropriatenessController],
  providers: [AppropriatenessStatusService, AppropriatenessAdminService],
  exports: [AppropriatenessAdminService],
})
export class AppropriatenessModule {}
