import { Injectable } from '@nestjs/common'
import type { DurableRunWorkflowInput } from './run-workflow.types.js'

export const TEMPORAL_RUN_CLIENT = Symbol('TEMPORAL_RUN_CLIENT')

export type StartDurableRunParams = {
  address: string
  namespace: string
  taskQueue: string
  workflowId: string
  input: DurableRunWorkflowInput
}

export type StartedTemporalWorkflow = {
  workflowId: string
  temporalRunId?: string
}

export type DescribeDurableRunParams = {
  address: string
  namespace: string
  workflowId: string
}

export type TemporalWorkflowDescription = {
  workflowId: string
  temporalRunId?: string
  status: string
}

export type TemporalRunClient = {
  startDurableRun(
    input: StartDurableRunParams,
  ): Promise<StartedTemporalWorkflow>
  describeDurableRun(
    input: DescribeDurableRunParams,
  ): Promise<TemporalWorkflowDescription>
}

@Injectable()
export class TemporalSdkRunClient implements TemporalRunClient {
  async startDurableRun(
    input: StartDurableRunParams,
  ): Promise<StartedTemporalWorkflow> {
    const connection = await this.createConnection(input.address)

    try {
      const client = await this.createClient(connection, input.namespace)
      const handle = await client.workflow.start('durableRunWorkflow', {
        taskQueue: input.taskQueue,
        workflowId: input.workflowId,
        args: [input.input],
      })

      return {
        workflowId: String(handle.workflowId),
        temporalRunId: this.optionalString(handle.firstExecutionRunId),
      }
    } finally {
      await connection.close()
    }
  }

  async describeDurableRun(
    input: DescribeDurableRunParams,
  ): Promise<TemporalWorkflowDescription> {
    const connection = await this.createConnection(input.address)

    try {
      const client = await this.createClient(connection, input.namespace)
      const handle = client.workflow.getHandle(input.workflowId)
      const description = await handle.describe()

      return {
        workflowId: input.workflowId,
        temporalRunId: this.optionalString(description.runId),
        status: this.normalizeRawStatus(description.status),
      }
    } finally {
      await connection.close()
    }
  }

  private async createConnection(address: string) {
    const { Connection } = await import('@temporalio/client')

    return Connection.connect({ address })
  }

  private async createClient(
    connection: Awaited<ReturnType<TemporalSdkRunClient['createConnection']>>,
    namespace: string,
  ) {
    const { Client } = await import('@temporalio/client')

    return new Client({ connection, namespace })
  }

  private normalizeRawStatus(status: unknown) {
    if (
      typeof status === 'object' &&
      status !== null &&
      'name' in status &&
      typeof status.name === 'string'
    ) {
      return status.name
    }

    return String(status)
  }

  private optionalString(value: unknown) {
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined
  }
}
