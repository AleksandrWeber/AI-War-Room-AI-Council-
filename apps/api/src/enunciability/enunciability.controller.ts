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
import { EnunciabilityAdminService } from './enunciability-admin.service.js'

type EnunciabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('enunciability')
export class EnunciabilityController {
  constructor(
    private readonly enunciabilityAdminService: EnunciabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.enunciabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getEnunciabilityRollout() {
    return this.enunciabilityAdminService.getEnunciabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceEnunciabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.enunciabilityAdminService.getWorkspaceEnunciabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeEnunciabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: EnunciabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_enunciability_summary') {
      throw new BadRequestException({
        message: 'Unsupported enunciability admin action.',
      })
    }

    return this.enunciabilityAdminService.executeEnunciabilityAdminAction(
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
