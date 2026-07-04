import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { NativeConnection, Worker } from '@temporalio/worker'
import { AppModule } from '../app.module.js'
import type { ApiEnv } from '../config/env.js'
import { RunsService } from '../runs/runs.service.js'
import { createRunWorkflowActivities } from './run-workflow.activities.js'
import { getTemporalWorkerConfig } from './temporal-worker.config.js'

export async function startTemporalWorker() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const configService = app.get(ConfigService<ApiEnv, true>)
  const runsService = app.get(RunsService)
  const workerConfig = getTemporalWorkerConfig(configService)
  const connection = await NativeConnection.connect({
    address: workerConfig.address,
  })

  const worker = await Worker.create({
    connection,
    namespace: workerConfig.namespace,
    taskQueue: workerConfig.taskQueue,
    workflowsPath: workerConfig.workflowsPath,
    activities: createRunWorkflowActivities(runsService),
  })

  console.log(
    `AI War Room Temporal worker listening on ${workerConfig.taskQueue} (${workerConfig.namespace})`,
  )

  await worker.run()
  await connection.close()
  await app.close()
}

if (process.env.NODE_ENV !== 'test') {
  void startTemporalWorker()
}
