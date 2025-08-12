import { z } from 'zod';

const baseInventorySchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  imageUrl: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  accessUsers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().optional(),
    })
  ).optional(),
});

export type InventorySettingSchema = z.infer<typeof baseInventorySchema>;

export const inventorySchema = (t: (key: string) => string) => {
  return baseInventorySchema
    .extend({
      title: z.string().min(1, t("TitleIsRequired")),
      description: z.string().optional(),
      category: z.string().min(1),
      imageUrl: z.string().optional().nullable(),
      tags: z.array(z.string()).optional(),
      isPublic: z.boolean().optional(),
      accessUsers: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          email: z.string().optional(),
        })
      ).optional(),
    });
};
