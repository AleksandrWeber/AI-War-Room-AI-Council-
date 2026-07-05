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
import { CaracterizabilityAdminService } from './caracterizability-admin.service.js'

type CaracterizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('caracterizability')
export class CaracterizabilityController {
  constructor(
    private readonly caracterizabilityAdminService: CaracterizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.caracterizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCaracterizabilityRollout() {
    return this.caracterizabilityAdminService.getCaracterizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCaracterizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.caracterizabilityAdminService.getWorkspaceCaracterizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCaracterizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CaracterizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_caracterizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported caracterizability admin action.',
      })
    }

    return this.caracterizabilityAdminService.executeCaracterizabilityAdminAction(
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
