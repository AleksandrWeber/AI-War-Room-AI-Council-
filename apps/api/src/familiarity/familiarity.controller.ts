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
import { FamiliarityAdminService } from './familiarity-admin.service.js'

type FamiliarityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('familiarity')
export class FamiliarityController {
  constructor(
    private readonly familiarityAdminService: FamiliarityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.familiarityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getFamiliarityRollout() {
    return this.familiarityAdminService.getFamiliarityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceFamiliarityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.familiarityAdminService.getWorkspaceFamiliarityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeFamiliarityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: FamiliarityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_familiarity_summary') {
      throw new BadRequestException({
        message: 'Unsupported familiarity admin action.',
      })
    }

    return this.familiarityAdminService.executeFamiliarityAdminAction(
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
