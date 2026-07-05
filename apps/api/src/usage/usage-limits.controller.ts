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
import { UsageLimitsAdminService } from './usage-limits-admin.service.js'

type QuotaAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('usage/limits')
export class UsageLimitsController {
  constructor(
    private readonly usageLimitsAdminService: UsageLimitsAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.usageLimitsAdminService.getCapabilities()
  }

  @Get('readiness')
  getUsageLimitsRollout() {
    return this.usageLimitsAdminService.getUsageLimitsRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceQuotaAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.usageLimitsAdminService.getWorkspaceQuotaAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeQuotaAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: QuotaAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_quota_summary') {
      throw new BadRequestException({
        message: 'Unsupported quota admin action.',
      })
    }

    return this.usageLimitsAdminService.executeQuotaAdminAction(
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
