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
import { PredictabilityAdminService } from './predictability-admin.service.js'

type PredictabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('predictability')
export class PredictabilityController {
  constructor(
    private readonly predictabilityAdminService: PredictabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.predictabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPredictabilityRollout() {
    return this.predictabilityAdminService.getPredictabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePredictabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.predictabilityAdminService.getWorkspacePredictabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePredictabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PredictabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_predictability_summary') {
      throw new BadRequestException({
        message: 'Unsupported predictability admin action.',
      })
    }

    return this.predictabilityAdminService.executePredictabilityAdminAction(
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
