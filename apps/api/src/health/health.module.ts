import { Module, forwardRef } from '@nestjs/common'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { RunsModule } from '../runs/runs.module.js'
import { HealthController } from './health.controller.js'
import { HealthService } from './health.service.js'
import { ReadinessService } from './readiness.service.js'

@Module({
  imports: [PersistenceModule, forwardRef(() => RunsModule)],
  controllers: [HealthController],
  providers: [HealthService, ReadinessService],
  exports: [HealthService, ReadinessService],
})
export class HealthModule {}
