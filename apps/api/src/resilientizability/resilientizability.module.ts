import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ResilientizabilityAdminService } from './resilientizability-admin.service.js'
import { ResilientizabilityController } from './resilientizability.controller.js'
import { ResilientizabilityStatusService } from './resilientizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ResilientizabilityController],
  providers: [ResilientizabilityStatusService, ResilientizabilityAdminService],
  exports: [ResilientizabilityAdminService],
})
export class ResilientizabilityModule {}
