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
import { SymbolizabilityAdminService } from './symbolizability-admin.service.js'

type SymbolizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('symbolizability')
export class SymbolizabilityController {
  constructor(
    private readonly symbolizabilityAdminService: SymbolizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.symbolizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSymbolizabilityRollout() {
    return this.symbolizabilityAdminService.getSymbolizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSymbolizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.symbolizabilityAdminService.getWorkspaceSymbolizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSymbolizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SymbolizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_symbolizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported symbolizability admin action.',
      })
    }

    return this.symbolizabilityAdminService.executeSymbolizabilityAdminAction(
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
