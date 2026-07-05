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
import { DistinguishabilityAdminService } from './distinguishability-admin.service.js'

type DistinguishabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('distinguishability')
export class DistinguishabilityController {
  constructor(
    private readonly distinguishabilityAdminService: DistinguishabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.distinguishabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDistinguishabilityRollout() {
    return this.distinguishabilityAdminService.getDistinguishabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDistinguishabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.distinguishabilityAdminService.getWorkspaceDistinguishabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDistinguishabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DistinguishabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_distinguishability_summary') {
      throw new BadRequestException({
        message: 'Unsupported distinguishability admin action.',
      })
    }

    return this.distinguishabilityAdminService.executeDistinguishabilityAdminAction(
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
