import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ExtensibilityAdminService } from './extensibility-admin.service.js'
import { ExtensibilityController } from './extensibility.controller.js'
import { ExtensibilityStatusService } from './extensibility-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ExtensibilityController],
  providers: [ExtensibilityStatusService, ExtensibilityAdminService],
  exports: [ExtensibilityAdminService],
})
export class ExtensibilityModule {}
