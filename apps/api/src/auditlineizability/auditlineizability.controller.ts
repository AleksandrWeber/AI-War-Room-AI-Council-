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
import { AuditlineizabilityAdminService } from './auditlineizability-admin.service.js'

type AuditlineizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('auditlineizability')
export class AuditlineizabilityController {
  constructor(
    private readonly auditlineizabilityAdminService: AuditlineizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.auditlineizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAuditlineizabilityRollout() {
    return this.auditlineizabilityAdminService.getAuditlineizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAuditlineizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.auditlineizabilityAdminService.getWorkspaceAuditlineizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAuditlineizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AuditlineizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_auditlineizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported auditlineizability admin action.',
      })
    }

    return this.auditlineizabilityAdminService.executeAuditlineizabilityAdminAction(
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
