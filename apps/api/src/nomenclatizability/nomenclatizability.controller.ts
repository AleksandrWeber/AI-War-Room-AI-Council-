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
import { NomenclatizabilityAdminService } from './nomenclatizability-admin.service.js'

type NomenclatizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('nomenclatizability')
export class NomenclatizabilityController {
  constructor(
    private readonly nomenclatizabilityAdminService: NomenclatizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.nomenclatizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNomenclatizabilityRollout() {
    return this.nomenclatizabilityAdminService.getNomenclatizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNomenclatizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.nomenclatizabilityAdminService.getWorkspaceNomenclatizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNomenclatizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NomenclatizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_nomenclatizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported nomenclatizability admin action.',
      })
    }

    return this.nomenclatizabilityAdminService.executeNomenclatizabilityAdminAction(
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
