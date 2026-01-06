// custom-body.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CustomBody = createParamDecorator(
  async (key: string | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    // If body is already parsed (unlikely if global parser disabled)
    const getValue = (body: any) => (key ? body?.[key] : body);

    if (req.body) {
      return getValue(req.body);
    }

    // Manually parse raw body
    const rawBody: any = await new Promise((resolve, reject) => {
      let raw = '';
      req.on('data', (chunk) => (raw += chunk));
      req.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch {
          resolve(raw); // fallback to raw string
        }
      });
      req.on('error', reject);
    });

    return getValue(rawBody);
  },
);
