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
import { SyntacticizabilityAdminService } from './syntacticizability-admin.service.js'

type SyntacticizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('syntacticizability')
export class SyntacticizabilityController {
  constructor(
    private readonly syntacticizabilityAdminService: SyntacticizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.syntacticizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSyntacticizabilityRollout() {
    return this.syntacticizabilityAdminService.getSyntacticizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSyntacticizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.syntacticizabilityAdminService.getWorkspaceSyntacticizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSyntacticizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SyntacticizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_syntacticizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported syntacticizability admin action.',
      })
    }

    return this.syntacticizabilityAdminService.executeSyntacticizabilityAdminAction(
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
