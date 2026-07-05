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
import { DistinctivenessAdminService } from './distinctiveness-admin.service.js'

type DistinctivenessAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('distinctiveness')
export class DistinctivenessController {
  constructor(
    private readonly distinctivenessAdminService: DistinctivenessAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.distinctivenessAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDistinctivenessRollout() {
    return this.distinctivenessAdminService.getDistinctivenessRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDistinctivenessAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.distinctivenessAdminService.getWorkspaceDistinctivenessAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDistinctivenessAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DistinctivenessAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_distinctiveness_summary') {
      throw new BadRequestException({
        message: 'Unsupported distinctiveness admin action.',
      })
    }

    return this.distinctivenessAdminService.executeDistinctivenessAdminAction(
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
