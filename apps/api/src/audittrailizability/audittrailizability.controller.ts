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
import { AudittrailizabilityAdminService } from './audittrailizability-admin.service.js'

type AudittrailizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('audittrailizability')
export class AudittrailizabilityController {
  constructor(
    private readonly audittrailizabilityAdminService: AudittrailizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.audittrailizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAudittrailizabilityRollout() {
    return this.audittrailizabilityAdminService.getAudittrailizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAudittrailizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.audittrailizabilityAdminService.getWorkspaceAudittrailizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAudittrailizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AudittrailizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_audittrailizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported audittrailizability admin action.',
      })
    }

    return this.audittrailizabilityAdminService.executeAudittrailizabilityAdminAction(
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
