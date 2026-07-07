import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InstrumentationizabilityAdminService } from './instrumentationizability-admin.service.js'
import { InstrumentationizabilityController } from './instrumentationizability.controller.js'
import { InstrumentationizabilityStatusService } from './instrumentationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [InstrumentationizabilityController],
  providers: [InstrumentationizabilityStatusService, InstrumentationizabilityAdminService],
  exports: [InstrumentationizabilityAdminService],
})
export class InstrumentationizabilityModule {}
