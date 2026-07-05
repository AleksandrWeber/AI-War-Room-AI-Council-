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
import { AdoptabilityAdminService } from './adoptability-admin.service.js'

type AdoptabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('adoptability')
export class AdoptabilityController {
  constructor(
    private readonly adoptabilityAdminService: AdoptabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.adoptabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAdoptabilityRollout() {
    return this.adoptabilityAdminService.getAdoptabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAdoptabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.adoptabilityAdminService.getWorkspaceAdoptabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAdoptabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AdoptabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_adoptability_summary') {
      throw new BadRequestException({
        message: 'Unsupported adoptability admin action.',
      })
    }

    return this.adoptabilityAdminService.executeAdoptabilityAdminAction(
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
