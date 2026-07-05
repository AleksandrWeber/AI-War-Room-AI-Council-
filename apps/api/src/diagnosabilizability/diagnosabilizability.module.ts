import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DiagnosabilizabilityAdminService } from './diagnosabilizability-admin.service.js'
import { DiagnosabilizabilityController } from './diagnosabilizability.controller.js'
import { DiagnosabilizabilityStatusService } from './diagnosabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DiagnosabilizabilityController],
  providers: [DiagnosabilizabilityStatusService, DiagnosabilizabilityAdminService],
  exports: [DiagnosabilizabilityAdminService],
})
export class DiagnosabilizabilityModule {}
