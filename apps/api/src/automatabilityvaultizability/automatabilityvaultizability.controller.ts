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
import { AutomatabilityvaultizabilityAdminService } from './automatabilityvaultizability-admin.service.js'

type AutomatabilityvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('automatabilityvaultizability')
export class AutomatabilityvaultizabilityController {
  constructor(
    private readonly automatabilityvaultizabilityAdminService: AutomatabilityvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.automatabilityvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAutomatabilityvaultizabilityRollout() {
    return this.automatabilityvaultizabilityAdminService.getAutomatabilityvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAutomatabilityvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.automatabilityvaultizabilityAdminService.getWorkspaceAutomatabilityvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAutomatabilityvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AutomatabilityvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_automatabilityvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported automatabilityvaultizability admin action.',
      })
    }

    return this.automatabilityvaultizabilityAdminService.executeAutomatabilityvaultizabilityAdminAction(
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
