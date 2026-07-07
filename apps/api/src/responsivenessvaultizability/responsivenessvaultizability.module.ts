import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ResponsivenessvaultizabilityAdminService } from './responsivenessvaultizability-admin.service.js'
import { ResponsivenessvaultizabilityController } from './responsivenessvaultizability.controller.js'
import { ResponsivenessvaultizabilityStatusService } from './responsivenessvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ResponsivenessvaultizabilityController],
  providers: [ResponsivenessvaultizabilityStatusService, ResponsivenessvaultizabilityAdminService],
  exports: [ResponsivenessvaultizabilityAdminService],
})
export class ResponsivenessvaultizabilityModule {}
