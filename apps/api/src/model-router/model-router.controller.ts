import {
  Body,
  Controller,
  BadRequestException,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  type AuthenticatedRequest,
  WorkspaceAccessGuard,
} from '../auth/workspace-access.guard.js'
import { ModelRouterAdminService } from './model-router-admin.service.js'
import { ModelRouterService } from './model-router.service.js'

type ModelHealthAdminBody = {
  workspaceId?: unknown
  action?: unknown
  modelId?: unknown
}

@Controller('model-router')
export class ModelRouterController {
  constructor(
    private readonly modelRouterService: ModelRouterService,
    private readonly modelRouterAdminService: ModelRouterAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.modelRouterAdminService.getCapabilities()
  }

  @Get('readiness')
  getModelRouterRollout() {
    return this.modelRouterAdminService.getModelRouterRollout()
  }

  @Get('registry')
  getRegistry() {
    return this.modelRouterService
      .getRegistrySnapshot()
      .then((models) => ({ models }))
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  getWorkspaceModelHealthAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.modelRouterAdminService.getWorkspaceModelHealthAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  executeModelHealthAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ModelHealthAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action
    const modelId = typeof body.modelId === 'string' ? body.modelId : ''

    if (action !== 'recover_model') {
      throw new BadRequestException({
        message: 'Unsupported model health admin action.',
      })
    }

    if (!modelId) {
      throw new BadRequestException({
        message: 'modelId is required for model health admin actions.',
      })
    }

    return this.modelRouterAdminService.executeModelHealthAdminAction(
      request.authContext!,
      {
        workspaceId,
        action,
        modelId,
      },
    )
  }

  @Get('registry/:modelId/health-events')
  getHealthEvents(@Param('modelId') modelId: string) {
    return this.modelRouterService
      .getHealthEvents(modelId)
      .then((events) => ({ modelId, events }))
  }

  @Post('registry/:modelId/recover')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(WorkspaceAccessGuard)
  recoverModel(
    @Param('modelId') modelId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.modelRouterAdminService.recoverModelAsAdmin(
      request.authContext!,
      modelId,
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
