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
import { GeneralizabilityAdminService } from './generalizability-admin.service.js'

type GeneralizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('generalizability')
export class GeneralizabilityController {
  constructor(
    private readonly generalizabilityAdminService: GeneralizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.generalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getGeneralizabilityRollout() {
    return this.generalizabilityAdminService.getGeneralizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceGeneralizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.generalizabilityAdminService.getWorkspaceGeneralizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeGeneralizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: GeneralizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_generalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported generalizability admin action.',
      })
    }

    return this.generalizabilityAdminService.executeGeneralizabilityAdminAction(
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
