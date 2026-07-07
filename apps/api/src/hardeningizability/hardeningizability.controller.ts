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
import { HardeningizabilityAdminService } from './hardeningizability-admin.service.js'

type HardeningizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('hardeningizability')
export class HardeningizabilityController {
  constructor(
    private readonly hardeningizabilityAdminService: HardeningizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.hardeningizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getHardeningizabilityRollout() {
    return this.hardeningizabilityAdminService.getHardeningizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceHardeningizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.hardeningizabilityAdminService.getWorkspaceHardeningizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeHardeningizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: HardeningizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_hardeningizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported hardeningizability admin action.',
      })
    }

    return this.hardeningizabilityAdminService.executeHardeningizabilityAdminAction(
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
