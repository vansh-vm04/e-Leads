import { z } from "zod";

export const CityEnum = z.enum([
  "Chandigarh",
  "Mohali",
  "Zirakpur",
  "Panchkula",
  "Other",
]);

export const PropertyTypeEnum = z.enum([
  "Apartment",
  "Villa",
  "Plot",
  "Office",
  "Retail",
]);

export const BHKEnum = z.enum(["One", "Two", "Three", "Four", "Studio"]);

export const PurposeEnum = z.enum(["Buy", "Rent"]);

export const TimeLineEnum = z.enum(["M0_3", "M3_6", "GT6", "Exploring"]);

export const SourceEnum = z.enum(["Website", "Referral", "Walk_in", "Other"]);

export const StatusEnum = z.enum([
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
]);

export type City = z.infer<typeof CityEnum>;
export type PropertyType = z.infer<typeof PropertyTypeEnum>;
export type BHK = z.infer<typeof BHKEnum>;
export type Purpose = z.infer<typeof PurposeEnum>;
export type TimeLine = z.infer<typeof TimeLineEnum>;
export type Source = z.infer<typeof SourceEnum>;
export type Status = z.infer<typeof StatusEnum>;
