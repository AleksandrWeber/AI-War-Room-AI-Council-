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
import { TaxonomizabilityAdminService } from './taxonomizability-admin.service.js'

type TaxonomizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('taxonomizability')
export class TaxonomizabilityController {
  constructor(
    private readonly taxonomizabilityAdminService: TaxonomizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.taxonomizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTaxonomizabilityRollout() {
    return this.taxonomizabilityAdminService.getTaxonomizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTaxonomizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.taxonomizabilityAdminService.getWorkspaceTaxonomizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTaxonomizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TaxonomizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_taxonomizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported taxonomizability admin action.',
      })
    }

    return this.taxonomizabilityAdminService.executeTaxonomizabilityAdminAction(
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
