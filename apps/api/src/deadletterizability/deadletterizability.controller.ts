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
import { DeadletterizabilityAdminService } from './deadletterizability-admin.service.js'

type DeadletterizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('deadletterizability')
export class DeadletterizabilityController {
  constructor(
    private readonly deadletterizabilityAdminService: DeadletterizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.deadletterizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDeadletterizabilityRollout() {
    return this.deadletterizabilityAdminService.getDeadletterizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDeadletterizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.deadletterizabilityAdminService.getWorkspaceDeadletterizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDeadletterizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DeadletterizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_deadletterizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported deadletterizability admin action.',
      })
    }

    return this.deadletterizabilityAdminService.executeDeadletterizabilityAdminAction(
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
