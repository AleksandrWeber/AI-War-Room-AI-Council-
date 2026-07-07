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
import { RegistrarizabilityAdminService } from './registrarizability-admin.service.js'

type RegistrarizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('registrarizability')
export class RegistrarizabilityController {
  constructor(
    private readonly registrarizabilityAdminService: RegistrarizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.registrarizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRegistrarizabilityRollout() {
    return this.registrarizabilityAdminService.getRegistrarizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRegistrarizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.registrarizabilityAdminService.getWorkspaceRegistrarizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRegistrarizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RegistrarizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_registrarizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported registrarizability admin action.',
      })
    }

    return this.registrarizabilityAdminService.executeRegistrarizabilityAdminAction(
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
