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
import { RollbackabilizabilityAdminService } from './rollbackabilizability-admin.service.js'

type RollbackabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('rollbackabilizability')
export class RollbackabilizabilityController {
  constructor(
    private readonly rollbackabilizabilityAdminService: RollbackabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.rollbackabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRollbackabilizabilityRollout() {
    return this.rollbackabilizabilityAdminService.getRollbackabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRollbackabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.rollbackabilizabilityAdminService.getWorkspaceRollbackabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRollbackabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RollbackabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_rollbackabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported rollbackabilizability admin action.',
      })
    }

    return this.rollbackabilizabilityAdminService.executeRollbackabilizabilityAdminAction(
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
