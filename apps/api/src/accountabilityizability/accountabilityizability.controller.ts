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
import { AccountabilityizabilityAdminService } from './accountabilityizability-admin.service.js'

type AccountabilityizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('accountabilityizability')
export class AccountabilityizabilityController {
  constructor(
    private readonly accountabilityizabilityAdminService: AccountabilityizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.accountabilityizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAccountabilityizabilityRollout() {
    return this.accountabilityizabilityAdminService.getAccountabilityizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAccountabilityizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.accountabilityizabilityAdminService.getWorkspaceAccountabilityizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAccountabilityizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AccountabilityizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_accountabilityizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported accountabilityizability admin action.',
      })
    }

    return this.accountabilityizabilityAdminService.executeAccountabilityizabilityAdminAction(
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
