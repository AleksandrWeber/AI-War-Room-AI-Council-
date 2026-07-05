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
import { CloningizabilityAdminService } from './cloningizability-admin.service.js'

type CloningizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('cloningizability')
export class CloningizabilityController {
  constructor(
    private readonly cloningizabilityAdminService: CloningizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.cloningizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCloningizabilityRollout() {
    return this.cloningizabilityAdminService.getCloningizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCloningizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.cloningizabilityAdminService.getWorkspaceCloningizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCloningizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CloningizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_cloningizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported cloningizability admin action.',
      })
    }

    return this.cloningizabilityAdminService.executeCloningizabilityAdminAction(
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
