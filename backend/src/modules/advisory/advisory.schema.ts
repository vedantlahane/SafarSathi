import { z } from 'zod';

const BaseAdvisorySchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(10),
  severity: z
    .preprocess((val) => (typeof val === 'string' ? val.toUpperCase() : val), z.enum(['INFO', 'WARNING', 'CRITICAL']))
    .default('INFO'),
  affectedArea: z.string().max(500).optional(),
  region: z.string().max(500).optional(),
  source: z.string().max(100).optional(),
  expiresAt: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
});

export const CreateAdvisorySchema = BaseAdvisorySchema.transform((data) => ({
  title: data.title,
  body: data.body,
  severity: data.severity,
  affectedArea: data.affectedArea || data.region,
  source: data.source,
  expiresAt: data.expiresAt || data.effectiveTo,
}));

export const UpdateAdvisorySchema = BaseAdvisorySchema.partial()
  .extend({
    active: z.boolean().optional(),
  })
  .transform((data) => ({
    title: data.title,
    body: data.body,
    severity: data.severity,
    affectedArea: data.affectedArea || data.region,
    source: data.source,
    expiresAt: data.expiresAt || data.effectiveTo,
    active: data.active,
  }));

export const AdvisoryIdParamSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type CreateAdvisoryInput = z.infer<typeof CreateAdvisorySchema>;
export type UpdateAdvisoryInput = z.infer<typeof UpdateAdvisorySchema>;
