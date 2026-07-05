import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { BenchmarkizabilityAdminService } from './benchmarkizability-admin.service.js'
import { BenchmarkizabilityController } from './benchmarkizability.controller.js'
import { BenchmarkizabilityStatusService } from './benchmarkizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [BenchmarkizabilityController],
  providers: [BenchmarkizabilityStatusService, BenchmarkizabilityAdminService],
  exports: [BenchmarkizabilityAdminService],
})
export class BenchmarkizabilityModule {}
