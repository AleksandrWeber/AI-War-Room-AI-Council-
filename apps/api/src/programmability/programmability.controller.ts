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
import { ProgrammabilityAdminService } from './programmability-admin.service.js'

type ProgrammabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('programmability')
export class ProgrammabilityController {
  constructor(
    private readonly programmabilityAdminService: ProgrammabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.programmabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getProgrammabilityRollout() {
    return this.programmabilityAdminService.getProgrammabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceProgrammabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.programmabilityAdminService.getWorkspaceProgrammabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeProgrammabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ProgrammabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_programmability_summary') {
      throw new BadRequestException({
        message: 'Unsupported programmability admin action.',
      })
    }

    return this.programmabilityAdminService.executeProgrammabilityAdminAction(
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
