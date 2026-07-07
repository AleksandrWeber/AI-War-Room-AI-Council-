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
import { TamperproofizabilityAdminService } from './tamperproofizability-admin.service.js'

type TamperproofizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('tamperproofizability')
export class TamperproofizabilityController {
  constructor(
    private readonly tamperproofizabilityAdminService: TamperproofizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.tamperproofizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTamperproofizabilityRollout() {
    return this.tamperproofizabilityAdminService.getTamperproofizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTamperproofizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.tamperproofizabilityAdminService.getWorkspaceTamperproofizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTamperproofizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TamperproofizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_tamperproofizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported tamperproofizability admin action.',
      })
    }

    return this.tamperproofizabilityAdminService.executeTamperproofizabilityAdminAction(
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
