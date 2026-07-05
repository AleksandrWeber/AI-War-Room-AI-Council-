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
import { ScanizabilityAdminService } from './scanizability-admin.service.js'

type ScanizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('scanizability')
export class ScanizabilityController {
  constructor(
    private readonly scanizabilityAdminService: ScanizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.scanizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getScanizabilityRollout() {
    return this.scanizabilityAdminService.getScanizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceScanizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.scanizabilityAdminService.getWorkspaceScanizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeScanizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ScanizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_scanizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported scanizability admin action.',
      })
    }

    return this.scanizabilityAdminService.executeScanizabilityAdminAction(
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
