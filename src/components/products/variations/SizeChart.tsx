import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Ruler, Save, X, Plus, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface SizeChartData {
  headers: string[];
  rows: Array<{
    size: string;
    measurements: Record<string, string>;
  }>;
}

interface SizeChartProps {
  productId: string;
  editable?: boolean;
  onUpdate?: () => void;
}

const SizeChart: React.FC<SizeChartProps> = ({
  productId,
  editable = false,
  onUpdate,
}) => {
  const [chartData, setChartData] = useState<SizeChartData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [unit, setUnit] = useState<"cm" | "inches">("cm");
  const [loading, setLoading] = useState(true);
  const [tempChartData, setTempChartData] = useState<SizeChartData | null>(null);

  useEffect(() => {
    fetchSizeChart();
  }, [productId]);

  const fetchSizeChart = async () => {
    try {
      const { data, error } = await supabase
        .from("product_size_charts")
        .select("*")
        .eq("product_id", productId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setChartData(data.chart_data as unknown as SizeChartData);
        setUnit(data.unit as "cm" | "inches");
      } else if (editable) {
        // Initialize with default structure
        const defaultChart: SizeChartData = {
          headers: ["Chest", "Waist", "Length"],
          rows: [
            { size: "S", measurements: { Chest: "36", Waist: "30", Length: "26" } },
            { size: "M", measurements: { Chest: "38", Waist: "32", Length: "27" } },
            { size: "L", measurements: { Chest: "40", Waist: "34", Length: "28" } },
            { size: "XL", measurements: { Chest: "42", Waist: "36", Length: "29" } },
          ],
        };
        setChartData(defaultChart);
      }
    } catch (error) {
      console.error("Error fetching size chart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tempChartData) return;

    try {
      const { error } = await supabase.from("product_size_charts").upsert(
        {
          product_id: productId,
          chart_data: tempChartData as unknown as any,
          unit,
          chart_type: "custom",
        },
        { onConflict: "product_id" }
      );

      if (error) throw error;

      setChartData(tempChartData);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Size chart saved successfully",
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error saving size chart:", error);
      toast({
        title: "Error",
        description: "Failed to save size chart",
        variant: "destructive",
      });
    }
  };

  const addRow = () => {
    if (!tempChartData) return;
    const newRow = {
      size: "",
      measurements: tempChartData.headers.reduce((acc, header) => {
        acc[header] = "";
        return acc;
      }, {} as Record<string, string>),
    };
    setTempChartData({
      ...tempChartData,
      rows: [...tempChartData.rows, newRow],
    });
  };

  const removeRow = (index: number) => {
    if (!tempChartData) return;
    setTempChartData({
      ...tempChartData,
      rows: tempChartData.rows.filter((_, i) => i !== index),
    });
  };

  const addColumn = () => {
    if (!tempChartData) return;
    const newHeader = `Measurement ${tempChartData.headers.length + 1}`;
    const updatedRows = tempChartData.rows.map((row) => ({
      ...row,
      measurements: { ...row.measurements, [newHeader]: "" },
    }));
    setTempChartData({
      headers: [...tempChartData.headers, newHeader],
      rows: updatedRows,
    });
  };

  const updateHeader = (index: number, value: string) => {
    if (!tempChartData) return;
    const oldHeader = tempChartData.headers[index];
    const newHeaders = [...tempChartData.headers];
    newHeaders[index] = value;

    const updatedRows = tempChartData.rows.map((row) => {
      const newMeasurements = { ...row.measurements };
      if (oldHeader !== value) {
        newMeasurements[value] = newMeasurements[oldHeader];
        delete newMeasurements[oldHeader];
      }
      return { ...row, measurements: newMeasurements };
    });

    setTempChartData({
      headers: newHeaders,
      rows: updatedRows,
    });
  };

  const updateCell = (rowIndex: number, field: string, value: string) => {
    if (!tempChartData) return;
    const updatedRows = [...tempChartData.rows];
    if (field === "size") {
      updatedRows[rowIndex].size = value;
    } else {
      updatedRows[rowIndex].measurements[field] = value;
    }
    setTempChartData({ ...tempChartData, rows: updatedRows });
  };

  if (loading) {
    return <div className="text-center py-4">Loading size chart...</div>;
  }

  if (!chartData && !editable) {
    return null;
  }

  const displayData = isEditing ? tempChartData : chartData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            <span>Size Chart</span>
          </div>
          {editable && !isEditing && (
            <Button
              size="sm"
              type="button"
              onClick={() => {
                setTempChartData(chartData);
                setIsEditing(true);
              }}
            >
              Edit Chart
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing && editable ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <Label>Unit</Label>
                <Select value={unit} onValueChange={(v) => setUnit(v as "cm" | "inches")}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">Centimeters</SelectItem>
                    <SelectItem value="inches">Inches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" size="sm" onClick={addColumn}>
                <Plus className="h-4 w-4 mr-1" />
                Add Column
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Size</TableHead>
                    {tempChartData?.headers.map((header, index) => (
                      <TableHead key={index}>
                        <Input
                          value={header}
                          onChange={(e) => updateHeader(index, e.target.value)}
                          className="w-32"
                        />
                      </TableHead>
                    ))}
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tempChartData?.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell>
                        <Input
                          value={row.size}
                          onChange={(e) => updateCell(rowIndex, "size", e.target.value)}
                          className="w-20"
                        />
                      </TableCell>
                      {tempChartData.headers.map((header) => (
                        <TableCell key={header}>
                          <Input
                            value={row.measurements[header] || ""}
                            onChange={(e) => updateCell(rowIndex, header, e.target.value)}
                            className="w-24"
                          />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeRow(rowIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={addRow}>
                <Plus className="h-4 w-4 mr-1" />
                Add Row
              </Button>
              <Button type="button" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save Chart
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setTempChartData(null);
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-2 text-sm text-muted-foreground">
              All measurements in {unit === "cm" ? "centimeters" : "inches"}
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Size</TableHead>
                    {displayData?.headers.map((header) => (
                      <TableHead key={header} className="font-semibold">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayData?.rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.size}</TableCell>
                      {displayData.headers.map((header) => (
                        <TableCell key={header}>{row.measurements[header]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const SizeChartDialog: React.FC<{ productId: string }> = ({ productId }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Ruler className="h-4 w-4 mr-1" />
          Size Chart
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Size Chart</DialogTitle>
        </DialogHeader>
        <SizeChart productId={productId} />
      </DialogContent>
    </Dialog>
  );
};

export default SizeChart;