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
import { CanonicalizabilityAdminService } from './canonicalizability-admin.service.js'

type CanonicalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('canonicalizability')
export class CanonicalizabilityController {
  constructor(
    private readonly canonicalizabilityAdminService: CanonicalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.canonicalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCanonicalizabilityRollout() {
    return this.canonicalizabilityAdminService.getCanonicalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCanonicalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.canonicalizabilityAdminService.getWorkspaceCanonicalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCanonicalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CanonicalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_canonicalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported canonicalizability admin action.',
      })
    }

    return this.canonicalizabilityAdminService.executeCanonicalizabilityAdminAction(
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
