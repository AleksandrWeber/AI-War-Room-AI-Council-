import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ParametrizabilityAdminService } from './parametrizability-admin.service.js'
import { ParametrizabilityController } from './parametrizability.controller.js'
import { ParametrizabilityStatusService } from './parametrizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ParametrizabilityController],
  providers: [ParametrizabilityStatusService, ParametrizabilityAdminService],
  exports: [ParametrizabilityAdminService],
})
export class ParametrizabilityModule {}
