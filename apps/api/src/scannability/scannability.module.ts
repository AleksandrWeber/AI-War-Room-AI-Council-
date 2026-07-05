import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ScannabilityAdminService } from './scannability-admin.service.js'
import { ScannabilityController } from './scannability.controller.js'
import { ScannabilityStatusService } from './scannability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ScannabilityController],
  providers: [ScannabilityStatusService, ScannabilityAdminService],
  exports: [ScannabilityAdminService],
})
export class ScannabilityModule {}
