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
import { TypifiabilityAdminService } from './typifiability-admin.service.js'

type TypifiabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('typifiability')
export class TypifiabilityController {
  constructor(
    private readonly typifiabilityAdminService: TypifiabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.typifiabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTypifiabilityRollout() {
    return this.typifiabilityAdminService.getTypifiabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTypifiabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.typifiabilityAdminService.getWorkspaceTypifiabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTypifiabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TypifiabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_typifiability_summary') {
      throw new BadRequestException({
        message: 'Unsupported typifiability admin action.',
      })
    }

    return this.typifiabilityAdminService.executeTypifiabilityAdminAction(
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
