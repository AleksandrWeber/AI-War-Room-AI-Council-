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
import { ModifiabilityAdminService } from './modifiability-admin.service.js'

type ModifiabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('modifiability')
export class ModifiabilityController {
  constructor(
    private readonly modifiabilityAdminService: ModifiabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.modifiabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getModifiabilityRollout() {
    return this.modifiabilityAdminService.getModifiabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceModifiabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.modifiabilityAdminService.getWorkspaceModifiabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeModifiabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ModifiabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_modifiability_summary') {
      throw new BadRequestException({
        message: 'Unsupported modifiability admin action.',
      })
    }

    return this.modifiabilityAdminService.executeModifiabilityAdminAction(
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
