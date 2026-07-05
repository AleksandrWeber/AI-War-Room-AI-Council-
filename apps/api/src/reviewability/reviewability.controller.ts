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
import { ReviewabilityAdminService } from './reviewability-admin.service.js'

type ReviewabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('reviewability')
export class ReviewabilityController {
  constructor(
    private readonly reviewabilityAdminService: ReviewabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.reviewabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getReviewabilityRollout() {
    return this.reviewabilityAdminService.getReviewabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceReviewabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.reviewabilityAdminService.getWorkspaceReviewabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeReviewabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ReviewabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_reviewability_summary') {
      throw new BadRequestException({
        message: 'Unsupported reviewability admin action.',
      })
    }

    return this.reviewabilityAdminService.executeReviewabilityAdminAction(
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
