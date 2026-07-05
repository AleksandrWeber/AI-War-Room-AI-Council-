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
import { ComposabilityAdminService } from './composability-admin.service.js'

type ComposabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('composability')
export class ComposabilityController {
  constructor(
    private readonly composabilityAdminService: ComposabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.composabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getComposabilityRollout() {
    return this.composabilityAdminService.getComposabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceComposabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.composabilityAdminService.getWorkspaceComposabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeComposabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ComposabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_composability_summary') {
      throw new BadRequestException({
        message: 'Unsupported composability admin action.',
      })
    }

    return this.composabilityAdminService.executeComposabilityAdminAction(
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
