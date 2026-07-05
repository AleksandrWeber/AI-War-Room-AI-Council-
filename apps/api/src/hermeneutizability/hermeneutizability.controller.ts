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
import { HermeneutizabilityAdminService } from './hermeneutizability-admin.service.js'

type HermeneutizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('hermeneutizability')
export class HermeneutizabilityController {
  constructor(
    private readonly hermeneutizabilityAdminService: HermeneutizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.hermeneutizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getHermeneutizabilityRollout() {
    return this.hermeneutizabilityAdminService.getHermeneutizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceHermeneutizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.hermeneutizabilityAdminService.getWorkspaceHermeneutizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeHermeneutizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: HermeneutizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_hermeneutizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported hermeneutizability admin action.',
      })
    }

    return this.hermeneutizabilityAdminService.executeHermeneutizabilityAdminAction(
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
