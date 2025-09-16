"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  CityEnum,
  PropertyTypeEnum,
  BHKEnum,
  PurposeEnum,
  TimeLineEnum,
  SourceEnum,
  StatusEnum,
} from "@/lib/zod/enums";
import { BuyerSchema } from "@/lib/zod/schema";
import { z } from "zod";
import {
  BHKMap,
  CityMap,
  PropertyTypeMap,
  PurposeMap,
  SourceMap,
  StatusMap,
  TimeLineMap,
  TimeLineOptions,
} from "@/lib/map";

export default function BuyerCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  type FormData = z.infer<typeof BuyerSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const propertyWatch = watch("propertyType");

  const bhkRequired =
    propertyWatch !== "Apartment" && propertyWatch !== "Villa";

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const t = toast.loading("Creating buyer...");
    try {
      setLoading(true);
      const res = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) {
        const { message } = await res.json();
        toast.update(t, {
          render: message || "Failed to create buyer",
          type: "error",
          autoClose: 1500,
          isLoading: false,
        });
        return;
      }

      toast.update(t, {
        render: "Buyer created successfully!",
        type: "success",
        autoClose: 1500,
        isLoading: false,
      });
      reset();
      router.push("/buyers");
    } catch {
      toast.update(t, {
        render: "Failed to create buyer",
        type: "error",
        autoClose: 1500,
        isLoading: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Create Buyer</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div>
          <label className="block mb-1 font-medium">Full Name</label>
          <Input
            placeholder="John Doe"
            {...register("fullName", {
              required: "Full name is required",
              minLength: {
                value: 2,
                message: "Full name must be at least 2 characters",
              },
              maxLength: {
                value: 80,
                message: "Full name cannot exceed 80 characters",
              },
            })}
          />
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <Input
            type="email"
            placeholder="john@example.com"
            {...register("email", {
              required: false,
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Phone</label>
          <Input
            type="number"
            placeholder="+91 9876543210"
            {...register("phone", {
              required: "Phone number is required",
              minLength: {
                value: 10,
                message: "Phone must be at least 10 digits",
              },
              maxLength: {
                value: 15,
                message: "Phone cannot exceed 15 digits",
              },
              setValueAs(value) {
                return String(value);
              },
            })}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">City</label>
          <Select
            onValueChange={(val) =>
              setValue("city", val as (typeof CityMap)[keyof typeof CityEnum], {
                shouldValidate: true,
              })
            }
            {...register("city", { required: "City is required" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(CityMap).map((city, i) => (
                <SelectItem key={i} value={CityMap[city]}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Property Type</label>
          <Select
            onValueChange={(val) =>
              setValue(
                "propertyType",
                val as (typeof PropertyTypeMap)[keyof typeof PropertyTypeEnum],
                { shouldValidate: true }
              )
            }
            {...register("propertyType", {
              required: "Property type is required",
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PropertyTypeMap).map((type, i) => (
                <SelectItem key={i} value={PropertyTypeMap[type]}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.propertyType && (
            <p className="text-sm text-red-500">
              {errors.propertyType.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">BHK</label>
          <Select
            disabled={bhkRequired}
            onValueChange={(val) =>
              setValue("bhk", val as (typeof BHKMap)[keyof typeof BHKEnum], {
                shouldValidate: true,
              })
            }
            {...register("bhk", {
              required: !bhkRequired ? "BHK is required when property is not Apartment/Villa" : false,
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select BHK" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(BHKMap).map((b, i) => (
                <SelectItem key={i} value={BHKMap[b]}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bhk && (
            <p className="text-sm text-red-500">{errors.bhk.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Purpose</label>
          <Select
            onValueChange={(val) =>
              setValue(
                "purpose",
                val as (typeof PurposeMap)[keyof typeof PurposeEnum],
                { shouldValidate: true }
              )
            }
            {...register("purpose", {
              required: { value: true, message: "Purpose is required" },
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PurposeMap).map((p, i) => (
                <SelectItem key={i} value={PurposeMap[p]}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.purpose && (
            <p className="text-sm text-red-500">{errors.purpose.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Budget Min (₹)</label>
          <Input
            type="number"
            {...register("budgetMin", { valueAsNumber: true })}
          />
          {errors.budgetMin && (
            <p className="text-sm text-red-500">{errors.budgetMin.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Budget Max (₹)</label>
          <Input
            type="number"
            {...register("budgetMax", { valueAsNumber: true })}
          />
          {errors.budgetMax && (
            <p className="text-sm text-red-500">{errors.budgetMax.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Timeline</label>
          <Select
            onValueChange={(val) =>
              setValue(
                "timeline",
                val as (typeof TimeLineMap)[keyof typeof TimeLineEnum],
                { shouldValidate: true }
              )
            }
            {...register("timeline", {
              required: { value: true, message: "Timeline is required" },
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TimeLineOptions).map((t, i) => (
                <SelectItem key={i} value={t[0]}>
                  {t[1]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timeline && (
            <p className="text-sm text-red-500">{errors.timeline.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Source</label>
          <Select
            onValueChange={(val) =>
              setValue(
                "source",
                val as (typeof SourceMap)[keyof typeof SourceEnum],
                { shouldValidate: true }
              )
            }
            {...register("source", {
              required: { value: true, message: "Source is required" },
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(SourceMap).map((s, i) => (
                <SelectItem key={i} value={SourceMap[s]}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.source && (
            <p className="text-sm text-red-500">{errors.source.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Status</label>
          <Select
            onValueChange={(val) =>
              setValue(
                "status",
                val as (typeof StatusMap)[keyof typeof StatusEnum],
                { shouldValidate: true }
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(StatusMap).map((s, i) => (
                <SelectItem key={i} value={StatusMap[s]}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 font-medium">Notes</label>
          <Textarea placeholder="Additional notes..." {...register("notes")} />
          {errors.notes && (
            <p className="text-sm text-red-500">{errors.notes.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 font-medium">
            Tags (comma separated)
          </label>
          <Input
            placeholder="investment, urgent"
            {...register("tags", {
              setValueAs: (val: string) =>
                val ? val.split(",").map((t) => t.trim()) : [],
            })}
          />
          {errors.tags && (
            <p className="text-sm text-red-500">{errors.tags.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Buyer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
