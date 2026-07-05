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
import { InventoryizabilityAdminService } from './inventoryizability-admin.service.js'

type InventoryizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('inventoryizability')
export class InventoryizabilityController {
  constructor(
    private readonly inventoryizabilityAdminService: InventoryizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.inventoryizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getInventoryizabilityRollout() {
    return this.inventoryizabilityAdminService.getInventoryizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceInventoryizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.inventoryizabilityAdminService.getWorkspaceInventoryizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeInventoryizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: InventoryizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_inventoryizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported inventoryizability admin action.',
      })
    }

    return this.inventoryizabilityAdminService.executeInventoryizabilityAdminAction(
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
