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
import { SemiotizabilityAdminService } from './semiotizability-admin.service.js'

type SemiotizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('semiotizability')
export class SemiotizabilityController {
  constructor(
    private readonly semiotizabilityAdminService: SemiotizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.semiotizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSemiotizabilityRollout() {
    return this.semiotizabilityAdminService.getSemiotizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSemiotizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.semiotizabilityAdminService.getWorkspaceSemiotizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSemiotizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SemiotizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_semiotizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported semiotizability admin action.',
      })
    }

    return this.semiotizabilityAdminService.executeSemiotizabilityAdminAction(
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
