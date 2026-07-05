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
import { TransferabilityAdminService } from './transferability-admin.service.js'

type TransferabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('transferability')
export class TransferabilityController {
  constructor(
    private readonly transferabilityAdminService: TransferabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.transferabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTransferabilityRollout() {
    return this.transferabilityAdminService.getTransferabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTransferabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.transferabilityAdminService.getWorkspaceTransferabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTransferabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TransferabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_transferability_summary') {
      throw new BadRequestException({
        message: 'Unsupported transferability admin action.',
      })
    }

    return this.transferabilityAdminService.executeTransferabilityAdminAction(
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
