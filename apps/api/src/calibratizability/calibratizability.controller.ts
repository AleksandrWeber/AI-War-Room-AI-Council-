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
import { CalibratizabilityAdminService } from './calibratizability-admin.service.js'

type CalibratizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('calibratizability')
export class CalibratizabilityController {
  constructor(
    private readonly calibratizabilityAdminService: CalibratizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.calibratizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCalibratizabilityRollout() {
    return this.calibratizabilityAdminService.getCalibratizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCalibratizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.calibratizabilityAdminService.getWorkspaceCalibratizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCalibratizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CalibratizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_calibratizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported calibratizability admin action.',
      })
    }

    return this.calibratizabilityAdminService.executeCalibratizabilityAdminAction(
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
