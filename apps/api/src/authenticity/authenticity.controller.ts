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
import { AuthenticityAdminService } from './authenticity-admin.service.js'

type AuthenticityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('authenticity')
export class AuthenticityController {
  constructor(
    private readonly authenticityAdminService: AuthenticityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.authenticityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAuthenticityRollout() {
    return this.authenticityAdminService.getAuthenticityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAuthenticityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.authenticityAdminService.getWorkspaceAuthenticityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAuthenticityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AuthenticityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_authenticity_summary') {
      throw new BadRequestException({
        message: 'Unsupported authenticity admin action.',
      })
    }

    return this.authenticityAdminService.executeAuthenticityAdminAction(
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
