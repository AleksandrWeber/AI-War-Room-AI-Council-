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
import { DeterminizabilityAdminService } from './determinizability-admin.service.js'

type DeterminizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('determinizability')
export class DeterminizabilityController {
  constructor(
    private readonly determinizabilityAdminService: DeterminizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.determinizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDeterminizabilityRollout() {
    return this.determinizabilityAdminService.getDeterminizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDeterminizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.determinizabilityAdminService.getWorkspaceDeterminizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDeterminizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DeterminizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_determinizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported determinizability admin action.',
      })
    }

    return this.determinizabilityAdminService.executeDeterminizabilityAdminAction(
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
