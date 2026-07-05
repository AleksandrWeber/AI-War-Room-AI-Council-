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
import { JustifiabilityAdminService } from './justifiability-admin.service.js'

type JustifiabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('justifiability')
export class JustifiabilityController {
  constructor(
    private readonly justifiabilityAdminService: JustifiabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.justifiabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getJustifiabilityRollout() {
    return this.justifiabilityAdminService.getJustifiabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceJustifiabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.justifiabilityAdminService.getWorkspaceJustifiabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeJustifiabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: JustifiabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_justifiability_summary') {
      throw new BadRequestException({
        message: 'Unsupported justifiability admin action.',
      })
    }

    return this.justifiabilityAdminService.executeJustifiabilityAdminAction(
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
