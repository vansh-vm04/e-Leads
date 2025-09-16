import {
  BHK,
  City,
  Purpose,
  PropertyType,
  TimeLine,
  Source,
  Status,
} from "@/lib/zod/enums";

export const SourceExportMap: Record<Source, string> = {
  Website: "Website",
  Referral: "Referral",
  Walk_in: "Walk-in",
  Call: "Call",
  Other: "Other",
};

export const TimeLineOptions = {
  M0_3: "Less than 3 months",
  M3_6: "3 to 6 months",
  GT6: "More than 6 months",
  Exploring: "Exploring",
};

export const TimeLineExportMap: Record<TimeLine, string> = {
  M0_3: "0-3m",
  M3_6: "3-6m",
  GT6: "6+m",
  Exploring: "Exploring",
};

export const CityMap: Record<string, City> = {
  Chandigarh: "Chandigarh",
  Mohali: "Mohali",
  Zirakpur: "Zirakpur",
  Panchkula: "Panchkula",
  Other: "Other",
};

export const PropertyTypeMap: Record<string, PropertyType> = {
  Apartment: "Apartment",
  Villa: "Villa",
  Plot: "Plot",
  Office: "Office",
  Retail: "Retail",
};

export const BHKMap: Record<string, BHK> = {
  One: "One",
  Two: "Two",
  Three: "Three",
  Four: "Four",
  Studio: "Studio",
};

export const PurposeMap: Record<string, Purpose> = {
  Buy: "Buy",
  Rent: "Rent",
};

export const TimeLineMap: Record<string, TimeLine> = {
  "0-3m": "M0_3",
  "3-6m": "M3_6",
  "6+m": "GT6",
  "Exploring": "Exploring",
};

export const SourceMap: Record<string, Source> = {
  Website: "Website",
  Referral: "Referral",
  "Walk-in": "Walk_in",
  Call: "Call",
  Other: "Other",
};

export const StatusMap: Record<string, Status> = {
  New: "New",
  Qualified: "Qualified",
  Contacted: "Contacted",
  Visited: "Visited",
  Negotiation: "Negotiation",
  Converted: "Converted",
  Dropped: "Dropped",
};
