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
import { CompactizabilityAdminService } from './compactizability-admin.service.js'

type CompactizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('compactizability')
export class CompactizabilityController {
  constructor(
    private readonly compactizabilityAdminService: CompactizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.compactizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCompactizabilityRollout() {
    return this.compactizabilityAdminService.getCompactizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCompactizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.compactizabilityAdminService.getWorkspaceCompactizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCompactizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CompactizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_compactizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported compactizability admin action.',
      })
    }

    return this.compactizabilityAdminService.executeCompactizabilityAdminAction(
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
