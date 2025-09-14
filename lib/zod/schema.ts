import { z } from "zod";
import {
  BHKEnum,
  CityEnum,
  PropertyTypeEnum,
  PurposeEnum,
  SourceEnum,
  StatusEnum,
  TimeLineEnum,
} from "./enums";

export const BuyerSchema = z
  .object({
    fullName: z.string().min(2).max(80),
    email: z.email().optional(),
    phone: z.string().min(10).max(15),
    city: CityEnum,
    propertyType: PropertyTypeEnum,
    bhk: BHKEnum.optional(),
    purpose: PurposeEnum,
    budgetMin: z.number().int().nonnegative().optional(),
    budgetMax: z.number().int().nonnegative().optional(),
    timeline: TimeLineEnum,
    source: SourceEnum,
    status: StatusEnum.default("New"),
    notes: z.string().max(1000).optional(),
    tags: z.array(z.string()).optional(),
    ownerId: z.uuid(),
  })
  .superRefine((data, ctx) => {
    if (
      data.budgetMin !== undefined &&
      data.budgetMax !== undefined &&
      data.budgetMax < data.budgetMin
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["budgetMax"],
        message: "budgetMax must be greater than or equal to budgetMin",
      });
    }

    if (
      (data.propertyType === "Apartment" || data.propertyType === "Villa") &&
      !data.bhk
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["bhk"],
        message: "BHK is required when propertyType is Apartment or Villa",
      });
    }
  });

export const BuyerHistorySchema = z.object({
  buyerId: z.uuid(),
  changedBy: z.uuid(),
  diff: z.record(z.string(), z.any()),
});

export type BuyerType = z.infer<typeof BuyerSchema>;
export type BuyerHistoryType = z.infer<typeof BuyerHistorySchema>;
