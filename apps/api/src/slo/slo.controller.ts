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
import { SloAdminService } from './slo-admin.service.js'

type SloAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('slo')
export class SloController {
  constructor(private readonly sloAdminService: SloAdminService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.sloAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSloRollout() {
    return this.sloAdminService.getSloRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSloAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.sloAdminService.getWorkspaceSloAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSloAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SloAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_slo_summary') {
      throw new BadRequestException({
        message: 'Unsupported SLO admin action.',
      })
    }

    return this.sloAdminService.executeSloAdminAction(request.authContext!, {
      workspaceId,
      action,
    })
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
