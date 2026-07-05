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
import { InteroperabilizabilityAdminService } from './interoperabilizability-admin.service.js'

type InteroperabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('interoperabilizability')
export class InteroperabilizabilityController {
  constructor(
    private readonly interoperabilizabilityAdminService: InteroperabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.interoperabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getInteroperabilizabilityRollout() {
    return this.interoperabilizabilityAdminService.getInteroperabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceInteroperabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.interoperabilizabilityAdminService.getWorkspaceInteroperabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeInteroperabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: InteroperabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_interoperabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported interoperabilizability admin action.',
      })
    }

    return this.interoperabilizabilityAdminService.executeInteroperabilizabilityAdminAction(
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
