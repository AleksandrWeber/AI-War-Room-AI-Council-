import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { LineageizabilityAdminService } from './lineageizability-admin.service.js'
import { LineageizabilityController } from './lineageizability.controller.js'
import { LineageizabilityStatusService } from './lineageizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [LineageizabilityController],
  providers: [LineageizabilityStatusService, LineageizabilityAdminService],
  exports: [LineageizabilityAdminService],
})
export class LineageizabilityModule {}
