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
import { IdentifiabilityAdminService } from './identifiability-admin.service.js'

type IdentifiabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('identifiability')
export class IdentifiabilityController {
  constructor(
    private readonly identifiabilityAdminService: IdentifiabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.identifiabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIdentifiabilityRollout() {
    return this.identifiabilityAdminService.getIdentifiabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIdentifiabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.identifiabilityAdminService.getWorkspaceIdentifiabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIdentifiabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IdentifiabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_identifiability_summary') {
      throw new BadRequestException({
        message: 'Unsupported identifiability admin action.',
      })
    }

    return this.identifiabilityAdminService.executeIdentifiabilityAdminAction(
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
