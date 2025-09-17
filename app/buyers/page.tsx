"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw } from "lucide-react";
import Logo from "@/components/ui/logo";
import { TimeLineOptions } from "@/lib/map";
import { TimeLine } from "@/lib/zod/enums";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import PageLoader from "@/components/PageLoader";

interface Buyer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  source: string;
  status: string;
  updatedAt: string;
  ownerId: string;
  owner: {
    name: string;
  };
}

export default function BuyersPage() {
  const [loadingExport, setLoadingExport] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("");
  const [timeline, setTimeline] = useState("");
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const [page, setPage] = useState(1);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        city,
        status,
        timeline,
        page: page.toString(),
      });
      const res = await fetch(`/api/buyers?${params.toString()}`);
      const data = await res.json();
      const buyers = await data.data.map((buyer: Buyer) => {
        return {
          ...buyer,
          timeline: TimeLineOptions[buyer.timeline as TimeLine],
        };
      });
      setBuyers(buyers || []);
      const Pages = data.total % 10 > 0 ? data.total / 10 : data.total / 10 + 1;
      setTotalPages(Pages);
    } catch {
      toast.error("Error fetching buyers");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchBuyers();
  }, [search, city, status, timeline, page]);

  const handleHistory = (buyerId: string) => {
    router.push(`/buyers/${buyerId}/history`);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setLoading(true);
    const t = toast.loading("Deleting buyer...");
    try {
      const res = await fetch(`/api/buyers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to delete buyer");
        return;
      }
      fetchBuyers();
      toast.update(t, {
        render: "Buyer Deleted",
        type: "success",
        autoClose: 1500,
        isLoading: false,
      });
    } catch {
      toast.update(t, {
        render: "Unable to delete, try again",
        type: "error",
        autoClose: 1500,
        isLoading: false,
      });
    } finally {
      setIsDeleting(false);
      setLoading(false);
    }
  };

  const handleAdd = () => {
    router.push(`/buyers/create`);
  };

  const handleEdit = (id: string) => {
    router.push(`/buyers/${id}/edit`);
  };

  const handleExport = async () => {
    const t = toast.loading("Exporting file...");
    try {
      setLoadingExport(true);
      const filters: Record<string, string> = {};
      if (city) filters.city = city;
      if (status) filters.status = status;
      if (timeline) filters.timeline = timeline;
      const response = await fetch("/api/buyers/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters: filters,
          orderBy: { updatedAt: "desc" },
        }),
      });

      if (response.status != 200) {
        throw new Error("Failed to export buyers");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "buyers.csv";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
      toast.update(t, {
        render: "File successfully exported",
        type: "success",
        autoClose: 1500,
        isLoading: false,
      });
    } catch {
      toast.update(t, {
        render: "Unable to export, try again",
        type: "error",
        autoClose: 1500,
        isLoading: false,
      });
    } finally {
      setLoadingExport(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const t = toast.loading("Importing...");
    try {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);

      const res = await fetch("/api/buyers/import", {
        method: "POST",
        body: formData,
      });
      const { message } = await res.json();
      if (!res.ok) {
        toast.update(t, {
          render: message || "Failed to import file",
          type: "error",
          autoClose: 1500,
          isLoading: false,
        });
        return;
      }
      toast.update(t, {
        render: "File successfully imported",
        type: "success",
        autoClose: 1500,
        isLoading: false,
      });
    } catch {
      toast.update(t, {
        render: "Failed to import file",
        type: "error",
        autoClose: 1500,
        isLoading: false,
      });
    } finally {
      fetchBuyers();
    }
  };

  const clearFilters = () => {
    setCity("");
    setTimeline("");
    setSearch("");
    setStatus("");
  };

  const logout = () => {
    signOut();
  };

  if (status === "loading") {
    return <PageLoader />;
  }

  return (
    <div className="p-6 h-screen space-y-6">
      <div className="w-full h-fit flex items-center justify-between px-6">
        <Logo />
        <Button
          disabled={loadingExport || loading}
          onClick={logout}
          variant="link"
          className="text-blue-600"
        >
          Sign Out
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search by name, phone, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />

        <Select onValueChange={setCity} value={city}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Chandigarh">Chandigarh</SelectItem>
            <SelectItem value="Mohali">Mohali</SelectItem>
            <SelectItem value="Zirakpur">Zirakpur</SelectItem>
            <SelectItem value="Panchkula">Panchkula</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setStatus} value={status}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Qualified">Qualified</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Visited">Visited</SelectItem>
            <SelectItem value="Negotiation">Negotiation</SelectItem>
            <SelectItem value="Converted">Converted</SelectItem>
            <SelectItem value="Dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setTimeline} value={timeline}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Timeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="M0_3">0-3m</SelectItem>
            <SelectItem value="M3_6">3-6m</SelectItem>
            <SelectItem value="GT6">{"6+m"}</SelectItem>
            <SelectItem value="Exploring">Exploring</SelectItem>
          </SelectContent>
        </Select>

        <Button
          disabled={loadingExport || loading}
          onClick={clearFilters}
          variant="outline"
        >
          Clear Filters
        </Button>

        <Button
          disabled={loadingExport || loading}
          onClick={handleExport}
          variant="outline"
        >
          Export CSV
        </Button>

        <Button disabled={loadingExport || loading} variant="outline" asChild>
          <label>
            Import CSV
            <input
              disabled={loadingExport || loading}
              type="file"
              accept=".csv"
              hidden
              onChange={handleImport}
            />
          </label>
        </Button>
        <Button
          disabled={loadingExport || loading}
          onClick={handleAdd}
          variant="outline"
        >
          Add Buyer
        </Button>
        <Button
          disabled={loadingExport || loading}
          onClick={fetchBuyers}
          variant="outline"
        >
          <RefreshCw />
        </Button>
      </div>

      <div className="border rounded-md">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin mr-2 h-5 w-5" />
            Loading...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Property Type</TableHead>
                <TableHead>BHK</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buyers.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.fullName}</TableCell>
                  <TableCell>{b.phone}</TableCell>
                  <TableCell>{b.city}</TableCell>
                  <TableCell>{b.propertyType}</TableCell>
                  <TableCell>{b.bhk || "-"}</TableCell>
                  <TableCell>
                    {b.budgetMin || b.budgetMax
                      ? `${b.budgetMin || ""} - ${b.budgetMax || ""}`
                      : "-"}
                  </TableCell>
                  <TableCell>{b.timeline}</TableCell>
                  <TableCell>{b.source}</TableCell>
                  <TableCell>{b.status}</TableCell>
                  <TableCell>
                    {new Date(b.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{b.owner?.name}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleHistory(b.id)}
                    >
                      History
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      disabled={session?.user?.id != b?.ownerId}
                      onClick={() => handleEdit(b.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={session?.user?.id != b?.ownerId || isDeleting}
                      onClick={() => handleDelete(b.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex rounded-md bg-white/50 fixed z-50 w-fit h-fit bottom-2 left-1/2 -translate-x-1/2 gap-10 items-center justify-center py-1 px-4">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page + "/" + Math.ceil(totalPages)}
        </span>
        <Button
          variant="outline"
          onClick={() => {
            if (page < totalPages) {
              setPage((p) => p + 1);
            }
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
