import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AuthenticityAdminService } from './authenticity-admin.service.js'
import { AuthenticityController } from './authenticity.controller.js'
import { AuthenticityStatusService } from './authenticity-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AuthenticityController],
  providers: [AuthenticityStatusService, AuthenticityAdminService],
  exports: [AuthenticityAdminService],
})
export class AuthenticityModule {}
