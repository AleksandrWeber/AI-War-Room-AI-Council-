import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { GlossarizabilityAdminService } from './glossarizability-admin.service.js'
import { GlossarizabilityController } from './glossarizability.controller.js'
import { GlossarizabilityStatusService } from './glossarizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [GlossarizabilityController],
  providers: [GlossarizabilityStatusService, GlossarizabilityAdminService],
  exports: [GlossarizabilityAdminService],
})
export class GlossarizabilityModule {}
