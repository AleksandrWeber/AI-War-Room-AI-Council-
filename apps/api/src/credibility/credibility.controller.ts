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
import { CredibilityAdminService } from './credibility-admin.service.js'

type CredibilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('credibility')
export class CredibilityController {
  constructor(
    private readonly credibilityAdminService: CredibilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.credibilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCredibilityRollout() {
    return this.credibilityAdminService.getCredibilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCredibilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.credibilityAdminService.getWorkspaceCredibilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCredibilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CredibilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_credibility_summary') {
      throw new BadRequestException({
        message: 'Unsupported credibility admin action.',
      })
    }

    return this.credibilityAdminService.executeCredibilityAdminAction(
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
