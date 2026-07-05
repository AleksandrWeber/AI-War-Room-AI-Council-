import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SerializabilityAdminService } from './serializability-admin.service.js'
import { SerializabilityController } from './serializability.controller.js'
import { SerializabilityStatusService } from './serializability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SerializabilityController],
  providers: [SerializabilityStatusService, SerializabilityAdminService],
  exports: [SerializabilityAdminService],
})
export class SerializabilityModule {}
