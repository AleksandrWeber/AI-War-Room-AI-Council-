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
import { InvalidationizabilityAdminService } from './invalidationizability-admin.service.js'

type InvalidationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('invalidationizability')
export class InvalidationizabilityController {
  constructor(
    private readonly invalidationizabilityAdminService: InvalidationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.invalidationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getInvalidationizabilityRollout() {
    return this.invalidationizabilityAdminService.getInvalidationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceInvalidationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.invalidationizabilityAdminService.getWorkspaceInvalidationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeInvalidationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: InvalidationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_invalidationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported invalidationizability admin action.',
      })
    }

    return this.invalidationizabilityAdminService.executeInvalidationizabilityAdminAction(
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
