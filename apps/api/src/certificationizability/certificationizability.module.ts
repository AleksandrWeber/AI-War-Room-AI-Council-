import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CertificationizabilityAdminService } from './certificationizability-admin.service.js'
import { CertificationizabilityController } from './certificationizability.controller.js'
import { CertificationizabilityStatusService } from './certificationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CertificationizabilityController],
  providers: [CertificationizabilityStatusService, CertificationizabilityAdminService],
  exports: [CertificationizabilityAdminService],
})
export class CertificationizabilityModule {}
