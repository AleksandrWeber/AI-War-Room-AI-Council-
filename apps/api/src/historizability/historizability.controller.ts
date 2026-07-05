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
import { HistorizabilityAdminService } from './historizability-admin.service.js'

type HistorizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('historizability')
export class HistorizabilityController {
  constructor(
    private readonly historizabilityAdminService: HistorizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.historizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getHistorizabilityRollout() {
    return this.historizabilityAdminService.getHistorizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceHistorizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.historizabilityAdminService.getWorkspaceHistorizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeHistorizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: HistorizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_historizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported historizability admin action.',
      })
    }

    return this.historizabilityAdminService.executeHistorizabilityAdminAction(
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
