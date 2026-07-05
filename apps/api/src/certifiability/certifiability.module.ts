import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CertifiabilityAdminService } from './certifiability-admin.service.js'
import { CertifiabilityController } from './certifiability.controller.js'
import { CertifiabilityStatusService } from './certifiability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CertifiabilityController],
  providers: [CertifiabilityStatusService, CertifiabilityAdminService],
  exports: [CertifiabilityAdminService],
})
export class CertifiabilityModule {}
