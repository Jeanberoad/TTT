import { z } from 'zod';
import { insertConfigurationSchema, configurations } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  config: {
    get: {
      method: 'GET' as const,
      path: '/api/config' as const,
      responses: {
        200: z.custom<typeof configurations.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/config' as const,
      input: insertConfigurationSchema.partial(),
      responses: {
        200: z.custom<typeof configurations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ConfigInput = z.infer<typeof api.config.update.input>;
export type ConfigResponse = z.infer<typeof api.config.update.responses[200]>;
