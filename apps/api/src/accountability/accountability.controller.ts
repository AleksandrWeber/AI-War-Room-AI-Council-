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
import { AccountabilityAdminService } from './accountability-admin.service.js'

type AccountabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('accountability')
export class AccountabilityController {
  constructor(
    private readonly accountabilityAdminService: AccountabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.accountabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAccountabilityRollout() {
    return this.accountabilityAdminService.getAccountabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAccountabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.accountabilityAdminService.getWorkspaceAccountabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAccountabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AccountabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_accountability_summary') {
      throw new BadRequestException({
        message: 'Unsupported accountability admin action.',
      })
    }

    return this.accountabilityAdminService.executeAccountabilityAdminAction(
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
