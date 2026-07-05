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
import { PersonifiabilityAdminService } from './personifiability-admin.service.js'

type PersonifiabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('personifiability')
export class PersonifiabilityController {
  constructor(
    private readonly personifiabilityAdminService: PersonifiabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.personifiabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPersonifiabilityRollout() {
    return this.personifiabilityAdminService.getPersonifiabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePersonifiabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.personifiabilityAdminService.getWorkspacePersonifiabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePersonifiabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PersonifiabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_personifiability_summary') {
      throw new BadRequestException({
        message: 'Unsupported personifiability admin action.',
      })
    }

    return this.personifiabilityAdminService.executePersonifiabilityAdminAction(
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
