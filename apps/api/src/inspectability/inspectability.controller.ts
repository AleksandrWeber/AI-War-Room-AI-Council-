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
import { InspectabilityAdminService } from './inspectability-admin.service.js'

type InspectabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('inspectability')
export class InspectabilityController {
  constructor(
    private readonly inspectabilityAdminService: InspectabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.inspectabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getInspectabilityRollout() {
    return this.inspectabilityAdminService.getInspectabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceInspectabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.inspectabilityAdminService.getWorkspaceInspectabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeInspectabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: InspectabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_inspectability_summary') {
      throw new BadRequestException({
        message: 'Unsupported inspectability admin action.',
      })
    }

    return this.inspectabilityAdminService.executeInspectabilityAdminAction(
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
