import { Controller, Get, ServiceUnavailableException, Logger } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { DataSource } from 'typeorm';

@Controller('api/health')
@AllowAnonymous() // All routes inside this controller are public
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly dataSource: DataSource) { }

  @Get()
  health() {
    this.logger.debug('Health check requested');
    return { status: 'ok' };
  }

  @Get('db')
  async dbHealth() {
    try {
      // Perform a real database operation
      await this.dataSource.query('SELECT 1');

      return { status: 'ok' };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'Database unavailable',
      });
    }
  }
}
