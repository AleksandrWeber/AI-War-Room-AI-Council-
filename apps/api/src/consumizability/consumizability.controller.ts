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
import { ConsumizabilityAdminService } from './consumizability-admin.service.js'

type ConsumizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('consumizability')
export class ConsumizabilityController {
  constructor(
    private readonly consumizabilityAdminService: ConsumizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.consumizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConsumizabilityRollout() {
    return this.consumizabilityAdminService.getConsumizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConsumizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.consumizabilityAdminService.getWorkspaceConsumizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConsumizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConsumizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_consumizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported consumizability admin action.',
      })
    }

    return this.consumizabilityAdminService.executeConsumizabilityAdminAction(
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
