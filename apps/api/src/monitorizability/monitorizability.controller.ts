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
import { MonitorizabilityAdminService } from './monitorizability-admin.service.js'

type MonitorizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('monitorizability')
export class MonitorizabilityController {
  constructor(
    private readonly monitorizabilityAdminService: MonitorizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.monitorizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMonitorizabilityRollout() {
    return this.monitorizabilityAdminService.getMonitorizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMonitorizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.monitorizabilityAdminService.getWorkspaceMonitorizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMonitorizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MonitorizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_monitorizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported monitorizability admin action.',
      })
    }

    return this.monitorizabilityAdminService.executeMonitorizabilityAdminAction(
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
