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
import { CatalogizabilityAdminService } from './catalogizability-admin.service.js'

type CatalogizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('catalogizability')
export class CatalogizabilityController {
  constructor(
    private readonly catalogizabilityAdminService: CatalogizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.catalogizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCatalogizabilityRollout() {
    return this.catalogizabilityAdminService.getCatalogizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCatalogizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.catalogizabilityAdminService.getWorkspaceCatalogizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCatalogizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CatalogizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_catalogizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported catalogizability admin action.',
      })
    }

    return this.catalogizabilityAdminService.executeCatalogizabilityAdminAction(
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
