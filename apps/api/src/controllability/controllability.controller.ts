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
import { ControllabilityAdminService } from './controllability-admin.service.js'

type ControllabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('controllability')
export class ControllabilityController {
  constructor(
    private readonly controllabilityAdminService: ControllabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.controllabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getControllabilityRollout() {
    return this.controllabilityAdminService.getControllabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceControllabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.controllabilityAdminService.getWorkspaceControllabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeControllabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ControllabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_controllability_summary') {
      throw new BadRequestException({
        message: 'Unsupported controllability admin action.',
      })
    }

    return this.controllabilityAdminService.executeControllabilityAdminAction(
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
