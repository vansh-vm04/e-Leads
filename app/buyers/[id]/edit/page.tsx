"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { BuyerSchema, BuyerType } from "@/lib/zod/schema";
import { z } from "zod";
import {
  BHKMap,
  CityMap,
  PropertyTypeMap,
  PurposeMap,
  SourceMap,
  StatusMap,
  TimeLineExportMap,
  TimeLineOptions,
} from "@/lib/map";
import { TimeLine } from "@/lib/zod/enums";

export default function BuyerEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<number>();
  type FormData = z.infer<typeof BuyerSchema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const propertyWatch = watch("propertyType");

  const bhkRequired =
    propertyWatch !== "Apartment" && propertyWatch !== "Villa";

  function transformBuyerResponse(serverData: BuyerType) {
    return {
      fullName: serverData.fullName,
      email: serverData.email || "",
      phone: serverData.phone,
      city: serverData.city,
      propertyType: serverData.propertyType,
      bhk: serverData.bhk ?? undefined,
      purpose: serverData.purpose,
      budgetMin: serverData.budgetMin,
      budgetMax: serverData.budgetMax,
      timeline: serverData.timeline,
      source: serverData.source,
      status: serverData.status,
      notes: serverData.notes || "",
      tags: (serverData.tags || [])
        .filter((t: string) => t && t.trim())
        .join(", "),
    };
  }

  const fetchBuyer = async () => {
    try {
      setFetching(true);
      const res = await fetch(`/api/buyers/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch buyer");
      const { data } = await res.json();
      setUpdatedAt(new Date(data.updatedAt).getTime());
      const transformedData = transformBuyerResponse(data);
      //@ts-ignore
      reset(transformedData);
    } catch (err) {
      toast.error("Error fetching buyer details");
      router.push("/buyers");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchBuyer();
  }, [params.id, reset, router]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const t = toast.loading("Updating buyer...");
    try {
      setLoading(true);
      const res = await fetch(`/api/buyers/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, updatedAt }),
      });

      if (!res.ok) {
        const { message } = await res.json();
        toast.update(t, {
          render: message || "Failed to update buyer",
          type: "error",
          autoClose: 1500,
          isLoading: false,
        });
        return;
      }

      toast.update(t, {
        render: "Buyer updated successfully!",
        type: "success",
        autoClose: 1500,
        isLoading: false,
      });
      router.push("/buyers");
    } catch {
      toast.update(t, {
        render: "Server error while updating buyer",
        type: "error",
        autoClose: 1500,
        isLoading: false,
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center py-10 text-lg">
        Loading buyer details...
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Edit Buyer</h1>
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
          <select
            className="input2"
            {...register("city", { required: "City is required" })}
            defaultValue=""
          >
            <option value="">Select City</option>
            {Object.keys(CityMap).map((item, i) => (
              <option key={i} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Property Type</label>
          <select
            className="input2"
            {...register("propertyType", {
              required: "Property type is required",
            })}
            defaultValue=""
          >
            <option value="">Select Property Type</option>
            {Object.keys(PropertyTypeMap).map((item, i) => (
              <option key={i} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.propertyType && (
            <p className="text-sm text-red-500">
              {errors.propertyType.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">BHK</label>
          <select
            disabled={bhkRequired}
            className="input2"
            {...register("bhk", {
              required: {
                value: !bhkRequired,
                message: "BHK is required",
              },
            })}
            defaultValue=""
          >
            <option value="">Select BHK</option>
            {Object.keys(BHKMap).map((item, i) => (
              <option key={i} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.bhk && (
            <p className="text-sm text-red-500">{errors.bhk.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Purpose</label>
          <select
            className="input2"
            {...register("purpose", {
              required: { value: true, message: "Purpose is required" },
            })}
            defaultValue=""
          >
            <option value="">Select Purpose</option>
            {Object.keys(PurposeMap).map((item, i) => (
              <option key={i} value={item}>
                {item}
              </option>
            ))}
          </select>
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
          <select
            className="input2"
            {...register("timeline", {
              required: { value: true, message: "Timeline is required" },
            })}
            defaultValue=""
          >
            <option value="">Select Timeline</option>
            {Object.entries(TimeLineExportMap).map((item, i) => (
              <option key={i} value={item[0]}>
                {TimeLineOptions[item[0] as TimeLine]}
              </option>
            ))}
          </select>
          {errors.timeline && (
            <p className="text-sm text-red-500">{errors.timeline.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Source</label>
          <select
            className="input2"
            {...register("source", {
              required: { value: true, message: "Source is required" },
            })}
            defaultValue=""
          >
            <option value="">Select Source</option>
            {Object.entries(SourceMap).map((item, i) => (
              <option key={i} value={item[1]}>
                {item[0]}
              </option>
            ))}
          </select>
          {errors.source && (
            <p className="text-sm text-red-500">{errors.source.message}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Status</label>
          <select className="input2" {...register("status")} defaultValue="">
            <option value="">Select Status</option>
            {Object.keys(StatusMap).map((item, i) => (
              <option key={i} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="text-sm text-red-500">{errors.status.message}</p>
          )}
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
              setValueAs(val) {
                return val ? val.split(",").map((t: string) => t.trim()) : [];
              },
            })}
          />
          {errors.tags && (
            <p className="text-sm text-red-500">{errors.tags.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Buyer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
