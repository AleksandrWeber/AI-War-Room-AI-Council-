import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { BufferizabilityAdminService } from './bufferizability-admin.service.js'
import { BufferizabilityController } from './bufferizability.controller.js'
import { BufferizabilityStatusService } from './bufferizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [BufferizabilityController],
  providers: [BufferizabilityStatusService, BufferizabilityAdminService],
  exports: [BufferizabilityAdminService],
})
export class BufferizabilityModule {}
