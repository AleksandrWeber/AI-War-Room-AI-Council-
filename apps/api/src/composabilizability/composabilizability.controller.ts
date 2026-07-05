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
import { ComposabilizabilityAdminService } from './composabilizability-admin.service.js'

type ComposabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('composabilizability')
export class ComposabilizabilityController {
  constructor(
    private readonly composabilizabilityAdminService: ComposabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.composabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getComposabilizabilityRollout() {
    return this.composabilizabilityAdminService.getComposabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceComposabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.composabilizabilityAdminService.getWorkspaceComposabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeComposabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ComposabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_composabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported composabilizability admin action.',
      })
    }

    return this.composabilizabilityAdminService.executeComposabilizabilityAdminAction(
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
