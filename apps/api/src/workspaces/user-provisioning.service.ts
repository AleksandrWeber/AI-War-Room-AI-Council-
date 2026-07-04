import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { userProvisioningResponseSchema } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  WORKSPACE_REPOSITORY,
  type WorkspaceRepository,
} from './workspace.repository.js'

@Injectable()
export class UserProvisioningService {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly configService: ConfigService<ApiEnv, true>,
  ) {}

  isAutoProvisionEnabled() {
    return this.configService.get('AUTH_EXTERNAL_AUTO_PROVISION', {
      infer: true,
    })
  }

  async provisionExternalMember(input: {
    userId: string
    workspaceId: string
    email?: string
    displayName?: string
  }) {
    const result = await this.workspaceRepository.provisionExternalMember(input)

    return userProvisioningResponseSchema.parse({
      userId: result.userId,
      workspaceId: result.workspaceId,
      role: result.role,
      actions: result.actions,
      provisionedAt: new Date().toISOString(),
    })
  }
}
