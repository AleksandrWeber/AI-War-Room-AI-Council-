import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Pool, type PoolClient, type QueryResultRow } from 'pg'
import type { ApiEnv } from '../config/env.js'

@Injectable()
export class PostgresService implements OnModuleDestroy {
  private readonly pool: Pool

  constructor(configService: ConfigService<ApiEnv, true>) {
    this.pool = new Pool({
      connectionString: configService.get('DATABASE_URL', { infer: true }),
    })
  }

  query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    values: unknown[] = [],
  ) {
    return this.pool.query<T>(sql, values)
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>) {
    const client = await this.pool.connect()

    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')

      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async onModuleDestroy() {
    await this.pool.end()
  }

  async ping() {
    await this.query('SELECT 1')
  }
}
