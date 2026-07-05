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
import { CodifiabilityAdminService } from './codifiability-admin.service.js'

type CodifiabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('codifiability')
export class CodifiabilityController {
  constructor(
    private readonly codifiabilityAdminService: CodifiabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.codifiabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCodifiabilityRollout() {
    return this.codifiabilityAdminService.getCodifiabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCodifiabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.codifiabilityAdminService.getWorkspaceCodifiabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCodifiabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CodifiabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_codifiability_summary') {
      throw new BadRequestException({
        message: 'Unsupported codifiability admin action.',
      })
    }

    return this.codifiabilityAdminService.executeCodifiabilityAdminAction(
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
