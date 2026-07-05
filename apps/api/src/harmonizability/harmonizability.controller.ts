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
import { HarmonizabilityAdminService } from './harmonizability-admin.service.js'

type HarmonizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('harmonizability')
export class HarmonizabilityController {
  constructor(
    private readonly harmonizabilityAdminService: HarmonizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.harmonizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getHarmonizabilityRollout() {
    return this.harmonizabilityAdminService.getHarmonizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceHarmonizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.harmonizabilityAdminService.getWorkspaceHarmonizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeHarmonizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: HarmonizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_harmonizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported harmonizability admin action.',
      })
    }

    return this.harmonizabilityAdminService.executeHarmonizabilityAdminAction(
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
