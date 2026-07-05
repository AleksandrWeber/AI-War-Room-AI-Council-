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
import { ConfirmabilityAdminService } from './confirmability-admin.service.js'

type ConfirmabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('confirmability')
export class ConfirmabilityController {
  constructor(
    private readonly confirmabilityAdminService: ConfirmabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.confirmabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConfirmabilityRollout() {
    return this.confirmabilityAdminService.getConfirmabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConfirmabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.confirmabilityAdminService.getWorkspaceConfirmabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConfirmabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConfirmabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_confirmability_summary') {
      throw new BadRequestException({
        message: 'Unsupported confirmability admin action.',
      })
    }

    return this.confirmabilityAdminService.executeConfirmabilityAdminAction(
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
