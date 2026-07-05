import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NomenclatizabilityAdminService } from './nomenclatizability-admin.service.js'
import { NomenclatizabilityController } from './nomenclatizability.controller.js'
import { NomenclatizabilityStatusService } from './nomenclatizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NomenclatizabilityController],
  providers: [NomenclatizabilityStatusService, NomenclatizabilityAdminService],
  exports: [NomenclatizabilityAdminService],
})
export class NomenclatizabilityModule {}
