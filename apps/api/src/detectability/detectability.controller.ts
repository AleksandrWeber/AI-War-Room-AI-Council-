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
import { DetectabilityAdminService } from './detectability-admin.service.js'

type DetectabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('detectability')
export class DetectabilityController {
  constructor(
    private readonly detectabilityAdminService: DetectabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.detectabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDetectabilityRollout() {
    return this.detectabilityAdminService.getDetectabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDetectabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.detectabilityAdminService.getWorkspaceDetectabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDetectabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DetectabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_detectability_summary') {
      throw new BadRequestException({
        message: 'Unsupported detectability admin action.',
      })
    }

    return this.detectabilityAdminService.executeDetectabilityAdminAction(
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
