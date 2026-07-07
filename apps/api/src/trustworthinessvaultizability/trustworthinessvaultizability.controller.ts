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
import { TrustworthinessvaultizabilityAdminService } from './trustworthinessvaultizability-admin.service.js'

type TrustworthinessvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('trustworthinessvaultizability')
export class TrustworthinessvaultizabilityController {
  constructor(
    private readonly trustworthinessvaultizabilityAdminService: TrustworthinessvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.trustworthinessvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTrustworthinessvaultizabilityRollout() {
    return this.trustworthinessvaultizabilityAdminService.getTrustworthinessvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTrustworthinessvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.trustworthinessvaultizabilityAdminService.getWorkspaceTrustworthinessvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTrustworthinessvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TrustworthinessvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_trustworthinessvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported trustworthinessvaultizability admin action.',
      })
    }

    return this.trustworthinessvaultizabilityAdminService.executeTrustworthinessvaultizabilityAdminAction(
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
