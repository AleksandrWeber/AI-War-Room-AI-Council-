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
import { MeasurabilityAdminService } from './measurability-admin.service.js'

type MeasurabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('measurability')
export class MeasurabilityController {
  constructor(
    private readonly measurabilityAdminService: MeasurabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.measurabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMeasurabilityRollout() {
    return this.measurabilityAdminService.getMeasurabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMeasurabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.measurabilityAdminService.getWorkspaceMeasurabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMeasurabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MeasurabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_measurability_summary') {
      throw new BadRequestException({
        message: 'Unsupported measurability admin action.',
      })
    }

    return this.measurabilityAdminService.executeMeasurabilityAdminAction(
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
