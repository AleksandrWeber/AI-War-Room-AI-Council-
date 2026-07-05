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
import { TrustworthinessAdminService } from './trustworthiness-admin.service.js'

type TrustworthinessAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('trustworthiness')
export class TrustworthinessController {
  constructor(
    private readonly trustworthinessAdminService: TrustworthinessAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.trustworthinessAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTrustworthinessRollout() {
    return this.trustworthinessAdminService.getTrustworthinessRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTrustworthinessAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.trustworthinessAdminService.getWorkspaceTrustworthinessAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTrustworthinessAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TrustworthinessAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_trustworthiness_summary') {
      throw new BadRequestException({
        message: 'Unsupported trustworthiness admin action.',
      })
    }

    return this.trustworthinessAdminService.executeTrustworthinessAdminAction(
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
