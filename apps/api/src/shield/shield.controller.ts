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
import { ShieldAdminService } from './shield-admin.service.js'

type ShieldReviewAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('shield')
export class ShieldController {
  constructor(private readonly shieldAdminService: ShieldAdminService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.shieldAdminService.getCapabilities()
  }

  @Get('readiness')
  getShieldRollout() {
    return this.shieldAdminService.getShieldRollout()
  }

  @Get('review-summary')
  @UseGuards(WorkspaceAccessGuard)
  getReviewSummary(@Req() request: AuthenticatedRequest) {
    return this.shieldAdminService.getReviewSummaryAsAdmin(request.authContext!)
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  getWorkspaceShieldReviewAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.shieldAdminService.getWorkspaceShieldReviewAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  executeShieldReviewAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ShieldReviewAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'rerun_review_summary') {
      throw new BadRequestException({
        message: 'Unsupported Shield review admin action.',
      })
    }

    return this.shieldAdminService.executeShieldReviewAdminAction(
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
