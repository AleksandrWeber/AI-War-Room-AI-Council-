import { Module } from '@nestjs/common'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { RunsController } from './runs.controller.js'
import { RunsService } from './runs.service.js'

@Module({
  imports: [PersistenceModule],
  controllers: [RunsController],
  providers: [RunsService],
})
export class RunsModule {}
