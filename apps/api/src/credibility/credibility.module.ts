import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CredibilityAdminService } from './credibility-admin.service.js'
import { CredibilityController } from './credibility.controller.js'
import { CredibilityStatusService } from './credibility-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CredibilityController],
  providers: [CredibilityStatusService, CredibilityAdminService],
  exports: [CredibilityAdminService],
})
export class CredibilityModule {}
