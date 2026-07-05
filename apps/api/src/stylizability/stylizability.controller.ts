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
import { StylizabilityAdminService } from './stylizability-admin.service.js'

type StylizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('stylizability')
export class StylizabilityController {
  constructor(
    private readonly stylizabilityAdminService: StylizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.stylizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getStylizabilityRollout() {
    return this.stylizabilityAdminService.getStylizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceStylizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.stylizabilityAdminService.getWorkspaceStylizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeStylizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: StylizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_stylizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported stylizability admin action.',
      })
    }

    return this.stylizabilityAdminService.executeStylizabilityAdminAction(
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
