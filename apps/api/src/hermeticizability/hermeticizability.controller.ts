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
import { HermeticizabilityAdminService } from './hermeticizability-admin.service.js'

type HermeticizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('hermeticizability')
export class HermeticizabilityController {
  constructor(
    private readonly hermeticizabilityAdminService: HermeticizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.hermeticizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getHermeticizabilityRollout() {
    return this.hermeticizabilityAdminService.getHermeticizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceHermeticizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.hermeticizabilityAdminService.getWorkspaceHermeticizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeHermeticizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: HermeticizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_hermeticizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported hermeticizability admin action.',
      })
    }

    return this.hermeticizabilityAdminService.executeHermeticizabilityAdminAction(
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
