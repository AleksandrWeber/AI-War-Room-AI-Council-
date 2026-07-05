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
import { TransparencyAdminService } from './transparency-admin.service.js'

type TransparencyAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('transparency')
export class TransparencyController {
  constructor(
    private readonly transparencyAdminService: TransparencyAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.transparencyAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTransparencyRollout() {
    return this.transparencyAdminService.getTransparencyRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTransparencyAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.transparencyAdminService.getWorkspaceTransparencyAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTransparencyAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TransparencyAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_transparency_summary') {
      throw new BadRequestException({
        message: 'Unsupported transparency admin action.',
      })
    }

    return this.transparencyAdminService.executeTransparencyAdminAction(
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
