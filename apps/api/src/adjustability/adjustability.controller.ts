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
import { AdjustabilityAdminService } from './adjustability-admin.service.js'

type AdjustabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('adjustability')
export class AdjustabilityController {
  constructor(
    private readonly adjustabilityAdminService: AdjustabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.adjustabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAdjustabilityRollout() {
    return this.adjustabilityAdminService.getAdjustabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAdjustabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.adjustabilityAdminService.getWorkspaceAdjustabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAdjustabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AdjustabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_adjustability_summary') {
      throw new BadRequestException({
        message: 'Unsupported adjustability admin action.',
      })
    }

    return this.adjustabilityAdminService.executeAdjustabilityAdminAction(
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
