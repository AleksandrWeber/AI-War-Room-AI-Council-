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
import { AuditingizabilityAdminService } from './auditingizability-admin.service.js'

type AuditingizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('auditingizability')
export class AuditingizabilityController {
  constructor(
    private readonly auditingizabilityAdminService: AuditingizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.auditingizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAuditingizabilityRollout() {
    return this.auditingizabilityAdminService.getAuditingizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAuditingizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.auditingizabilityAdminService.getWorkspaceAuditingizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAuditingizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AuditingizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_auditingizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported auditingizability admin action.',
      })
    }

    return this.auditingizabilityAdminService.executeAuditingizabilityAdminAction(
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
