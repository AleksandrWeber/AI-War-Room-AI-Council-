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
import { OperabilizabilityAdminService } from './operabilizability-admin.service.js'

type OperabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('operabilizability')
export class OperabilizabilityController {
  constructor(
    private readonly operabilizabilityAdminService: OperabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.operabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getOperabilizabilityRollout() {
    return this.operabilizabilityAdminService.getOperabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceOperabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.operabilizabilityAdminService.getWorkspaceOperabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeOperabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: OperabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_operabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported operabilizability admin action.',
      })
    }

    return this.operabilizabilityAdminService.executeOperabilizabilityAdminAction(
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
