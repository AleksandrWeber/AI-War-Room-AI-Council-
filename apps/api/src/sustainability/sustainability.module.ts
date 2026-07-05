import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SustainabilityAdminService } from './sustainability-admin.service.js'
import { SustainabilityController } from './sustainability.controller.js'
import { SustainabilityStatusService } from './sustainability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SustainabilityController],
  providers: [SustainabilityStatusService, SustainabilityAdminService],
  exports: [SustainabilityAdminService],
})
export class SustainabilityModule {}
