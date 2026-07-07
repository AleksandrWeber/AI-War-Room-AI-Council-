import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SpecificationizabilityAdminService } from './specificationizability-admin.service.js'
import { SpecificationizabilityController } from './specificationizability.controller.js'
import { SpecificationizabilityStatusService } from './specificationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SpecificationizabilityController],
  providers: [SpecificationizabilityStatusService, SpecificationizabilityAdminService],
  exports: [SpecificationizabilityAdminService],
})
export class SpecificationizabilityModule {}
