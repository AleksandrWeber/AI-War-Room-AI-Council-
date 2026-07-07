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
import { AuditproofizabilityAdminService } from './auditproofizability-admin.service.js'

type AuditproofizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('auditproofizability')
export class AuditproofizabilityController {
  constructor(
    private readonly auditproofizabilityAdminService: AuditproofizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.auditproofizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAuditproofizabilityRollout() {
    return this.auditproofizabilityAdminService.getAuditproofizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAuditproofizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.auditproofizabilityAdminService.getWorkspaceAuditproofizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAuditproofizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AuditproofizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_auditproofizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported auditproofizability admin action.',
      })
    }

    return this.auditproofizabilityAdminService.executeAuditproofizabilityAdminAction(
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
