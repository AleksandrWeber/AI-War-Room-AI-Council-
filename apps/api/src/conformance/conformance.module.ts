import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConformanceAdminService } from './conformance-admin.service.js'
import { ConformanceController } from './conformance.controller.js'
import { ConformanceStatusService } from './conformance-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConformanceController],
  providers: [ConformanceStatusService, ConformanceAdminService],
  exports: [ConformanceAdminService],
})
export class ConformanceModule {}
