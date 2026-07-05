import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DemonstrabilityAdminService } from './demonstrability-admin.service.js'
import { DemonstrabilityController } from './demonstrability.controller.js'
import { DemonstrabilityStatusService } from './demonstrability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DemonstrabilityController],
  providers: [DemonstrabilityStatusService, DemonstrabilityAdminService],
  exports: [DemonstrabilityAdminService],
})
export class DemonstrabilityModule {}
