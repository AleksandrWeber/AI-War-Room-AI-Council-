import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CertifiabilityvaultizabilityAdminService } from './certifiabilityvaultizability-admin.service.js'
import { CertifiabilityvaultizabilityController } from './certifiabilityvaultizability.controller.js'
import { CertifiabilityvaultizabilityStatusService } from './certifiabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CertifiabilityvaultizabilityController],
  providers: [CertifiabilityvaultizabilityStatusService, CertifiabilityvaultizabilityAdminService],
  exports: [CertifiabilityvaultizabilityAdminService],
})
export class CertifiabilityvaultizabilityModule {}
