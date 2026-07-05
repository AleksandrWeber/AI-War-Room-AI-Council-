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
import { AssessabilityAdminService } from './assessability-admin.service.js'

type AssessabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('assessability')
export class AssessabilityController {
  constructor(
    private readonly assessabilityAdminService: AssessabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.assessabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAssessabilityRollout() {
    return this.assessabilityAdminService.getAssessabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAssessabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.assessabilityAdminService.getWorkspaceAssessabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAssessabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AssessabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_assessability_summary') {
      throw new BadRequestException({
        message: 'Unsupported assessability admin action.',
      })
    }

    return this.assessabilityAdminService.executeAssessabilityAdminAction(
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
