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
import { ForensicizabilityAdminService } from './forensicizability-admin.service.js'

type ForensicizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('forensicizability')
export class ForensicizabilityController {
  constructor(
    private readonly forensicizabilityAdminService: ForensicizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.forensicizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getForensicizabilityRollout() {
    return this.forensicizabilityAdminService.getForensicizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceForensicizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.forensicizabilityAdminService.getWorkspaceForensicizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeForensicizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ForensicizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_forensicizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported forensicizability admin action.',
      })
    }

    return this.forensicizabilityAdminService.executeForensicizabilityAdminAction(
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
