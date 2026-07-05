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
import { AuditabilityAdminService } from './auditability-admin.service.js'

type AuditabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('auditability')
export class AuditabilityController {
  constructor(
    private readonly auditabilityAdminService: AuditabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.auditabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAuditabilityRollout() {
    return this.auditabilityAdminService.getAuditabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAuditabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.auditabilityAdminService.getWorkspaceAuditabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAuditabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AuditabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_auditability_summary') {
      throw new BadRequestException({
        message: 'Unsupported auditability admin action.',
      })
    }

    return this.auditabilityAdminService.executeAuditabilityAdminAction(
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
