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
import { InterfabilizabilityAdminService } from './interfabilizability-admin.service.js'

type InterfabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('interfabilizability')
export class InterfabilizabilityController {
  constructor(
    private readonly interfabilizabilityAdminService: InterfabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.interfabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getInterfabilizabilityRollout() {
    return this.interfabilizabilityAdminService.getInterfabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceInterfabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.interfabilizabilityAdminService.getWorkspaceInterfabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeInterfabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: InterfabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_interfabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported interfabilizability admin action.',
      })
    }

    return this.interfabilizabilityAdminService.executeInterfabilizabilityAdminAction(
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
