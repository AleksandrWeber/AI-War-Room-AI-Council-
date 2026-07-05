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
import { LearnabilityAdminService } from './learnability-admin.service.js'

type LearnabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('learnability')
export class LearnabilityController {
  constructor(
    private readonly learnabilityAdminService: LearnabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.learnabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getLearnabilityRollout() {
    return this.learnabilityAdminService.getLearnabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceLearnabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.learnabilityAdminService.getWorkspaceLearnabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeLearnabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: LearnabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_learnability_summary') {
      throw new BadRequestException({
        message: 'Unsupported learnability admin action.',
      })
    }

    return this.learnabilityAdminService.executeLearnabilityAdminAction(
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
