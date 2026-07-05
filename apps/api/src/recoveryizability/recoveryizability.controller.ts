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
import { RecoveryizabilityAdminService } from './recoveryizability-admin.service.js'

type RecoveryizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('recoveryizability')
export class RecoveryizabilityController {
  constructor(
    private readonly recoveryizabilityAdminService: RecoveryizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.recoveryizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRecoveryizabilityRollout() {
    return this.recoveryizabilityAdminService.getRecoveryizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRecoveryizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.recoveryizabilityAdminService.getWorkspaceRecoveryizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRecoveryizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RecoveryizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_recoveryizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported recoveryizability admin action.',
      })
    }

    return this.recoveryizabilityAdminService.executeRecoveryizabilityAdminAction(
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
