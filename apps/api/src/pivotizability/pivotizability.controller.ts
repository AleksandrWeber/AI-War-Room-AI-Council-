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
import { PivotizabilityAdminService } from './pivotizability-admin.service.js'

type PivotizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('pivotizability')
export class PivotizabilityController {
  constructor(
    private readonly pivotizabilityAdminService: PivotizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.pivotizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPivotizabilityRollout() {
    return this.pivotizabilityAdminService.getPivotizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePivotizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.pivotizabilityAdminService.getWorkspacePivotizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePivotizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PivotizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_pivotizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported pivotizability admin action.',
      })
    }

    return this.pivotizabilityAdminService.executePivotizabilityAdminAction(
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
