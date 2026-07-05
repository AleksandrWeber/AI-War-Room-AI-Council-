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
import { WarrantabilityAdminService } from './warrantability-admin.service.js'

type WarrantabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('warrantability')
export class WarrantabilityController {
  constructor(
    private readonly warrantabilityAdminService: WarrantabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.warrantabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getWarrantabilityRollout() {
    return this.warrantabilityAdminService.getWarrantabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceWarrantabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.warrantabilityAdminService.getWorkspaceWarrantabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeWarrantabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: WarrantabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_warrantability_summary') {
      throw new BadRequestException({
        message: 'Unsupported warrantability admin action.',
      })
    }

    return this.warrantabilityAdminService.executeWarrantabilityAdminAction(
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
