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
import { OrdinarizabilityAdminService } from './ordinarizability-admin.service.js'

type OrdinarizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('ordinarizability')
export class OrdinarizabilityController {
  constructor(
    private readonly ordinarizabilityAdminService: OrdinarizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.ordinarizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getOrdinarizabilityRollout() {
    return this.ordinarizabilityAdminService.getOrdinarizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceOrdinarizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.ordinarizabilityAdminService.getWorkspaceOrdinarizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeOrdinarizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: OrdinarizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_ordinarizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported ordinarizability admin action.',
      })
    }

    return this.ordinarizabilityAdminService.executeOrdinarizabilityAdminAction(
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
