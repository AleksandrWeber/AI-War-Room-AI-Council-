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
import { ShieldFalsePositiveService } from './shield-false-positive.service.js'
import { ShieldFullScanRetainService } from './shield-full-scan-retain.service.js'
import { ShieldOverrideService } from './shield-override.service.js'

type ShieldReviewAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('shield')
export class ShieldController {
  constructor(
    private readonly shieldAdminService: ShieldAdminService,
    private readonly shieldOverrideService: ShieldOverrideService,
    private readonly shieldFalsePositiveService: ShieldFalsePositiveService,
    private readonly shieldFullScanRetainService: ShieldFullScanRetainService,
  ) {}

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

    if (
      action !== 'rerun_review_summary' &&
      action !== 'purge_expired_full_scans'
    ) {
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

  @Get('workspace/:workspaceId/scans/:scanId/full')
  @UseGuards(WorkspaceAccessGuard)
  getFullShieldScanForDispute(
    @Param('workspaceId') workspaceId: string,
    @Param('scanId') scanId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.shieldFullScanRetainService.getFullScanForDispute({
      authContext: request.authContext!,
      workspaceId,
      scanId,
    })
  }

  @Post('runs/:runId/override')
  @UseGuards(WorkspaceAccessGuard)
  createShieldOverride(
    @Param('runId') runId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ) {
    return this.shieldOverrideService.createOverride({
      runId,
      authContext: request.authContext!,
      body,
    })
  }

  @Post('runs/:runId/false-positive-reports')
  @UseGuards(WorkspaceAccessGuard)
  createShieldFalsePositiveReport(
    @Param('runId') runId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ) {
    return this.shieldFalsePositiveService.createReport({
      runId,
      authContext: request.authContext!,
      body,
    })
  }

  @Get('workspace/:workspaceId/false-positive-reports')
  @UseGuards(WorkspaceAccessGuard)
  listShieldFalsePositiveReports(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.shieldFalsePositiveService.listWorkspaceReports(
      request.authContext!,
      workspaceId,
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
