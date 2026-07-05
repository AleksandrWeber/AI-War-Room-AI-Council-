import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { FlexibilityAdminService } from './flexibility-admin.service.js'
import { FlexibilityController } from './flexibility.controller.js'
import { FlexibilityStatusService } from './flexibility-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [FlexibilityController],
  providers: [FlexibilityStatusService, FlexibilityAdminService],
  exports: [FlexibilityAdminService],
})
export class FlexibilityModule {}
