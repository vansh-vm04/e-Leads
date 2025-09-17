import { describe, it, expect } from "vitest";
import { BuyerSchema } from "../zod/schema";
import {
  CityEnum,
  PropertyTypeEnum,
  PurposeEnum,
  TimeLineEnum,
  SourceEnum,
  StatusEnum,
  BHKEnum,
  City,
} from "../zod/enums";

const baseData = {
  fullName: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  city: CityEnum.enum.Mohali,           
  propertyType: PropertyTypeEnum.enum.Plot,
  purpose: PurposeEnum.enum.Buy,
  budgetMin: 100000,
  budgetMax: 200000,
  timeline: TimeLineEnum.enum.M0_3,     
  source: SourceEnum.enum.Referral,
  status: StatusEnum.enum.New,
  notes: "Looking for investment",
  tags: ["priority"],
  ownerId: "550e8400-e29b-41d4-a716-446655440000", // valid uuid
};

describe("BuyerSchema", () => {
  it("should fail if budgetMax < budgetMin", () => {
    const result = BuyerSchema.safeParse({
      ...baseData,
      budgetMin: 500000,
      budgetMax: 100000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("budgetMax"))).toBe(
        true
      );
    }
  });

  it("should fail if propertyType is Apartment without bhk", () => {
    const result = BuyerSchema.safeParse({
      ...baseData,
      propertyType: PropertyTypeEnum.enum.Apartment,
      bhk: undefined,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("bhk"))).toBe(true);
    }
  });

  it("should pass with valid Apartment + bhk", () => {
    const result = BuyerSchema.safeParse({
      ...baseData,
      propertyType: PropertyTypeEnum.enum.Apartment,
      bhk: BHKEnum.enum.Two, 
    });
    expect(result.success).toBe(true);
  });

  it("should pass with valid data (Plot)", () => {
    const result = BuyerSchema.safeParse(baseData);
    expect(result.success).toBe(true);
  });
});
