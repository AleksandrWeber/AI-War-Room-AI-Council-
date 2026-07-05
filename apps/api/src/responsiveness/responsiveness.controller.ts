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
import { ResponsivenessAdminService } from './responsiveness-admin.service.js'

type ResponsivenessAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('responsiveness')
export class ResponsivenessController {
  constructor(
    private readonly responsivenessAdminService: ResponsivenessAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.responsivenessAdminService.getCapabilities()
  }

  @Get('readiness')
  async getResponsivenessRollout() {
    return this.responsivenessAdminService.getResponsivenessRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceResponsivenessAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.responsivenessAdminService.getWorkspaceResponsivenessAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeResponsivenessAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ResponsivenessAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_responsiveness_summary') {
      throw new BadRequestException({
        message: 'Unsupported responsiveness admin action.',
      })
    }

    return this.responsivenessAdminService.executeResponsivenessAdminAction(
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
