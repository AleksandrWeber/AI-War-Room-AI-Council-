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
import { AuditjournalizabilityAdminService } from './auditjournalizability-admin.service.js'

type AuditjournalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('auditjournalizability')
export class AuditjournalizabilityController {
  constructor(
    private readonly auditjournalizabilityAdminService: AuditjournalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.auditjournalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAuditjournalizabilityRollout() {
    return this.auditjournalizabilityAdminService.getAuditjournalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAuditjournalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.auditjournalizabilityAdminService.getWorkspaceAuditjournalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAuditjournalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AuditjournalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_auditjournalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported auditjournalizability admin action.',
      })
    }

    return this.auditjournalizabilityAdminService.executeAuditjournalizabilityAdminAction(
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
