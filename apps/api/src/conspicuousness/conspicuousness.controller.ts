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
import { ConspicuousnessAdminService } from './conspicuousness-admin.service.js'

type ConspicuousnessAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('conspicuousness')
export class ConspicuousnessController {
  constructor(
    private readonly conspicuousnessAdminService: ConspicuousnessAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.conspicuousnessAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConspicuousnessRollout() {
    return this.conspicuousnessAdminService.getConspicuousnessRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConspicuousnessAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.conspicuousnessAdminService.getWorkspaceConspicuousnessAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConspicuousnessAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConspicuousnessAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_conspicuousness_summary') {
      throw new BadRequestException({
        message: 'Unsupported conspicuousness admin action.',
      })
    }

    return this.conspicuousnessAdminService.executeConspicuousnessAdminAction(
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
