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
import { NonrepudiationizabilityAdminService } from './nonrepudiationizability-admin.service.js'

type NonrepudiationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('nonrepudiationizability')
export class NonrepudiationizabilityController {
  constructor(
    private readonly nonrepudiationizabilityAdminService: NonrepudiationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.nonrepudiationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNonrepudiationizabilityRollout() {
    return this.nonrepudiationizabilityAdminService.getNonrepudiationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNonrepudiationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.nonrepudiationizabilityAdminService.getWorkspaceNonrepudiationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNonrepudiationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NonrepudiationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_nonrepudiationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported nonrepudiationizability admin action.',
      })
    }

    return this.nonrepudiationizabilityAdminService.executeNonrepudiationizabilityAdminAction(
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
