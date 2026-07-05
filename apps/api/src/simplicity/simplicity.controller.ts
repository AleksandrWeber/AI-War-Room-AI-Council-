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
import { SimplicityAdminService } from './simplicity-admin.service.js'

type SimplicityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('simplicity')
export class SimplicityController {
  constructor(
    private readonly simplicityAdminService: SimplicityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.simplicityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSimplicityRollout() {
    return this.simplicityAdminService.getSimplicityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSimplicityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.simplicityAdminService.getWorkspaceSimplicityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSimplicityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SimplicityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_simplicity_summary') {
      throw new BadRequestException({
        message: 'Unsupported simplicity admin action.',
      })
    }

    return this.simplicityAdminService.executeSimplicityAdminAction(
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
