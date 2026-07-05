import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PerceptibilityAdminService } from './perceptibility-admin.service.js'
import { PerceptibilityController } from './perceptibility.controller.js'
import { PerceptibilityStatusService } from './perceptibility-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PerceptibilityController],
  providers: [PerceptibilityStatusService, PerceptibilityAdminService],
  exports: [PerceptibilityAdminService],
})
export class PerceptibilityModule {}
