import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DialectizabilityAdminService } from './dialectizability-admin.service.js'
import { DialectizabilityController } from './dialectizability.controller.js'
import { DialectizabilityStatusService } from './dialectizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DialectizabilityController],
  providers: [DialectizabilityStatusService, DialectizabilityAdminService],
  exports: [DialectizabilityAdminService],
})
export class DialectizabilityModule {}
