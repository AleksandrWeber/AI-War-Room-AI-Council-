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
import { ConcretizabilityAdminService } from './concretizability-admin.service.js'

type ConcretizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('concretizability')
export class ConcretizabilityController {
  constructor(
    private readonly concretizabilityAdminService: ConcretizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.concretizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConcretizabilityRollout() {
    return this.concretizabilityAdminService.getConcretizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConcretizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.concretizabilityAdminService.getWorkspaceConcretizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConcretizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConcretizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_concretizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported concretizability admin action.',
      })
    }

    return this.concretizabilityAdminService.executeConcretizabilityAdminAction(
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
