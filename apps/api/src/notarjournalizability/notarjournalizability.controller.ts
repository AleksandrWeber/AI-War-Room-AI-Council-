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
import { NotarjournalizabilityAdminService } from './notarjournalizability-admin.service.js'

type NotarjournalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('notarjournalizability')
export class NotarjournalizabilityController {
  constructor(
    private readonly notarjournalizabilityAdminService: NotarjournalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.notarjournalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNotarjournalizabilityRollout() {
    return this.notarjournalizabilityAdminService.getNotarjournalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNotarjournalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.notarjournalizabilityAdminService.getWorkspaceNotarjournalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNotarjournalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NotarjournalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_notarjournalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported notarjournalizability admin action.',
      })
    }

    return this.notarjournalizabilityAdminService.executeNotarjournalizabilityAdminAction(
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
