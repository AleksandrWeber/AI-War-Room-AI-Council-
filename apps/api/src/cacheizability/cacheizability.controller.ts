import {
  Body,
  Controller,
  BadRequestException,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  type AuthenticatedRequest,
  WorkspaceAccessGuard,
} from '../auth/workspace-access.guard.js'
import { CacheizabilityAdminService } from './cacheizability-admin.service.js'

type CacheizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('cacheizability')
export class CacheizabilityController {
  constructor(
    private readonly cacheizabilityAdminService: CacheizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.cacheizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCacheizabilityRollout() {
    return this.cacheizabilityAdminService.getCacheizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCacheizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.cacheizabilityAdminService.getWorkspaceCacheizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCacheizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CacheizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_cacheizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported cacheizability admin action.',
      })
    }

    return this.cacheizabilityAdminService.executeCacheizabilityAdminAction(
      request.authContext!,
      {
        workspaceId,
        action,
      },
    )
  }

  private assertWorkspaceParam(
    request: AuthenticatedRequest,
    workspaceId: string,
  ) {
    const requestWorkspaceId = request.authContext?.workspaceId

    if (requestWorkspaceId && requestWorkspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace parameter does not match authenticated workspace.',
      })
    }
  }
}
