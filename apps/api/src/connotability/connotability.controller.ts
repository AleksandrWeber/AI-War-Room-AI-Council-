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
import { ConnotabilityAdminService } from './connotability-admin.service.js'

type ConnotabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('connotability')
export class ConnotabilityController {
  constructor(
    private readonly connotabilityAdminService: ConnotabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.connotabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConnotabilityRollout() {
    return this.connotabilityAdminService.getConnotabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConnotabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.connotabilityAdminService.getWorkspaceConnotabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConnotabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConnotabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_connotability_summary') {
      throw new BadRequestException({
        message: 'Unsupported connotability admin action.',
      })
    }

    return this.connotabilityAdminService.executeConnotabilityAdminAction(
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
