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
import { PredictizabilityAdminService } from './predictizability-admin.service.js'

type PredictizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('predictizability')
export class PredictizabilityController {
  constructor(
    private readonly predictizabilityAdminService: PredictizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.predictizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPredictizabilityRollout() {
    return this.predictizabilityAdminService.getPredictizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePredictizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.predictizabilityAdminService.getWorkspacePredictizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePredictizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PredictizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_predictizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported predictizability admin action.',
      })
    }

    return this.predictizabilityAdminService.executePredictizabilityAdminAction(
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
