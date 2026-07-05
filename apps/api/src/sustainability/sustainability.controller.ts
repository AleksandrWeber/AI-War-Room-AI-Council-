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
import { SustainabilityAdminService } from './sustainability-admin.service.js'

type SustainabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('sustainability')
export class SustainabilityController {
  constructor(
    private readonly sustainabilityAdminService: SustainabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.sustainabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSustainabilityRollout() {
    return this.sustainabilityAdminService.getSustainabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSustainabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.sustainabilityAdminService.getWorkspaceSustainabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSustainabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SustainabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_sustainability_summary') {
      throw new BadRequestException({
        message: 'Unsupported sustainability admin action.',
      })
    }

    return this.sustainabilityAdminService.executeSustainabilityAdminAction(
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
