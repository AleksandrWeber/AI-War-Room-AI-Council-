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
import { RetrievabilityAdminService } from './retrievability-admin.service.js'

type RetrievabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('retrievability')
export class RetrievabilityController {
  constructor(
    private readonly retrievabilityAdminService: RetrievabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.retrievabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRetrievabilityRollout() {
    return this.retrievabilityAdminService.getRetrievabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRetrievabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.retrievabilityAdminService.getWorkspaceRetrievabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRetrievabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RetrievabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_retrievability_summary') {
      throw new BadRequestException({
        message: 'Unsupported retrievability admin action.',
      })
    }

    return this.retrievabilityAdminService.executeRetrievabilityAdminAction(
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
