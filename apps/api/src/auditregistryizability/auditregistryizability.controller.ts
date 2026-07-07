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
import { AuditregistryizabilityAdminService } from './auditregistryizability-admin.service.js'

type AuditregistryizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('auditregistryizability')
export class AuditregistryizabilityController {
  constructor(
    private readonly auditregistryizabilityAdminService: AuditregistryizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.auditregistryizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAuditregistryizabilityRollout() {
    return this.auditregistryizabilityAdminService.getAuditregistryizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAuditregistryizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.auditregistryizabilityAdminService.getWorkspaceAuditregistryizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAuditregistryizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AuditregistryizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_auditregistryizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported auditregistryizability admin action.',
      })
    }

    return this.auditregistryizabilityAdminService.executeAuditregistryizabilityAdminAction(
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
