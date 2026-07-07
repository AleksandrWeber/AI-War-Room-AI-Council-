import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RegistrarizabilityAdminService } from './registrarizability-admin.service.js'
import { RegistrarizabilityController } from './registrarizability.controller.js'
import { RegistrarizabilityStatusService } from './registrarizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RegistrarizabilityController],
  providers: [RegistrarizabilityStatusService, RegistrarizabilityAdminService],
  exports: [RegistrarizabilityAdminService],
})
export class RegistrarizabilityModule {}
