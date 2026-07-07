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
import { LedgerizabilityAdminService } from './ledgerizability-admin.service.js'

type LedgerizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('ledgerizability')
export class LedgerizabilityController {
  constructor(
    private readonly ledgerizabilityAdminService: LedgerizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.ledgerizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getLedgerizabilityRollout() {
    return this.ledgerizabilityAdminService.getLedgerizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceLedgerizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.ledgerizabilityAdminService.getWorkspaceLedgerizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeLedgerizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: LedgerizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_ledgerizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported ledgerizability admin action.',
      })
    }

    return this.ledgerizabilityAdminService.executeLedgerizabilityAdminAction(
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
