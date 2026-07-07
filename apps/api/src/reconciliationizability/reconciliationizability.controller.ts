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
import { ReconciliationizabilityAdminService } from './reconciliationizability-admin.service.js'

type ReconciliationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('reconciliationizability')
export class ReconciliationizabilityController {
  constructor(
    private readonly reconciliationizabilityAdminService: ReconciliationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.reconciliationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getReconciliationizabilityRollout() {
    return this.reconciliationizabilityAdminService.getReconciliationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceReconciliationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.reconciliationizabilityAdminService.getWorkspaceReconciliationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeReconciliationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ReconciliationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_reconciliationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported reconciliationizability admin action.',
      })
    }

    return this.reconciliationizabilityAdminService.executeReconciliationizabilityAdminAction(
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
