import { Module } from '@nestjs/common'
import { ObservabilityModule } from '../observability/observability.module.js'
import { AdvancedShieldService } from './advanced-shield.service.js'
import { DeterministicShieldClassifier } from './deterministic-shield.classifier.js'
import { ShieldController } from './shield.controller.js'

@Module({
  imports: [ObservabilityModule],
  controllers: [ShieldController],
  providers: [AdvancedShieldService, DeterministicShieldClassifier],
  exports: [AdvancedShieldService],
})
export class ShieldModule {}
