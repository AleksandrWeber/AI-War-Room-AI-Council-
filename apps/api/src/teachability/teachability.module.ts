import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TeachabilityAdminService } from './teachability-admin.service.js'
import { TeachabilityController } from './teachability.controller.js'
import { TeachabilityStatusService } from './teachability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TeachabilityController],
  providers: [TeachabilityStatusService, TeachabilityAdminService],
  exports: [TeachabilityAdminService],
})
export class TeachabilityModule {}
