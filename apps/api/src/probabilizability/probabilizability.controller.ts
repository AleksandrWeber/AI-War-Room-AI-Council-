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
import { ProbabilizabilityAdminService } from './probabilizability-admin.service.js'

type ProbabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('probabilizability')
export class ProbabilizabilityController {
  constructor(
    private readonly probabilizabilityAdminService: ProbabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.probabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getProbabilizabilityRollout() {
    return this.probabilizabilityAdminService.getProbabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceProbabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.probabilizabilityAdminService.getWorkspaceProbabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeProbabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ProbabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_probabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported probabilizability admin action.',
      })
    }

    return this.probabilizabilityAdminService.executeProbabilizabilityAdminAction(
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
