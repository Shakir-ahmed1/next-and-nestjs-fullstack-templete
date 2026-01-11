import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PUBLIC_URL } from 'config';
import { DataSource } from 'typeorm';

@Controller('api/health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  health() {
    return { status: 'ok', PUBLIC_URL };
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
