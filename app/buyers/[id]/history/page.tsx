"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BuyerHistory {
  id: string;
  buyerId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  changedAt: string;
  diff: Record<string, { old: string; new: string }>;
}

export default function BuyerHistoryPage() {
  const params = useParams();
  const buyerId = params?.id as string;

  const [history, setHistory] = useState<BuyerHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/buyers/${buyerId}/history`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error("Error fetching history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (buyerId) {
      fetchHistory();
    }
  }, [buyerId]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Buyer History</h1>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="animate-spin mr-2 h-5 w-5" />
          Loading history...
        </div>
      ) : history.length === 0 ? (
        <p>No history available for this buyer.</p>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {new Date(entry.changedAt).toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Changed by {entry.user?.name}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Old Value</TableHead>
                      <TableHead>New Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(entry.diff).map(([field, values]) => (
                      <TableRow key={field}>
                        <TableCell className="font-medium">{field}</TableCell>
                        <TableCell className="text-red-600">
                          {values.old ?? "-"}
                        </TableCell>
                        <TableCell className="text-green-600">
                          {values.new ?? "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
