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
import { GlossarizabilityAdminService } from './glossarizability-admin.service.js'

type GlossarizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('glossarizability')
export class GlossarizabilityController {
  constructor(
    private readonly glossarizabilityAdminService: GlossarizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.glossarizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getGlossarizabilityRollout() {
    return this.glossarizabilityAdminService.getGlossarizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceGlossarizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.glossarizabilityAdminService.getWorkspaceGlossarizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeGlossarizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: GlossarizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_glossarizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported glossarizability admin action.',
      })
    }

    return this.glossarizabilityAdminService.executeGlossarizabilityAdminAction(
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
