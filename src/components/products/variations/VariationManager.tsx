import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Save, Edit2, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ColorSwatch from "./ColorSwatch";

interface Variation {
  id?: string;
  product_id: string;
  variation_type: string;
  variation_value: string;
  variation_label?: string;
  hex_color?: string;
  price_adjustment: number;
  stock_quantity: number;
  is_available: boolean;
  sort_order: number;
  image_url?: string;
}

interface VariationManagerProps {
  productId: string;
  basePrice: number;
  onUpdate?: () => void;
}

const VariationManager: React.FC<VariationManagerProps> = ({
  productId,
  basePrice,
  onUpdate,
}) => {
  const [variations, setVariations] = useState<Variation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVariation, setEditingVariation] = useState<Variation | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newVariation, setNewVariation] = useState<Partial<Variation>>({
    product_id: productId,
    variation_type: "color",
    variation_value: "",
    price_adjustment: 0,
    stock_quantity: 0,
    is_available: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchVariations();
  }, [productId]);

  const fetchVariations = async () => {
    try {
      const { data, error } = await supabase
        .from("product_variations")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setVariations(data || []);
    } catch (error) {
      console.error("Error fetching variations:", error);
      toast({
        title: "Error",
        description: "Failed to load product variations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariation = async () => {
    if (!newVariation.variation_value) {
      toast({
        title: "Error",
        description: "Please provide a variation value",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("product_variations")
        .insert([newVariation as Variation]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Variation added successfully",
      });

      setNewVariation({
        product_id: productId,
        variation_type: "color",
        variation_value: "",
        price_adjustment: 0,
        stock_quantity: 0,
        is_available: true,
        sort_order: 0,
      });
      setIsAddingNew(false);
      fetchVariations();
      onUpdate?.();
    } catch (error) {
      console.error("Error adding variation:", error);
      toast({
        title: "Error",
        description: "Failed to add variation",
        variant: "destructive",
      });
    }
  };

  const handleUpdateVariation = async (id: string) => {
    if (!editingVariation) return;

    try {
      const { error } = await supabase
        .from("product_variations")
        .update(editingVariation)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Variation updated successfully",
      });

      setEditingVariation(null);
      fetchVariations();
      onUpdate?.();
    } catch (error) {
      console.error("Error updating variation:", error);
      toast({
        title: "Error",
        description: "Failed to update variation",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVariation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("product_variations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Variation deleted successfully",
      });

      fetchVariations();
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting variation:", error);
      toast({
        title: "Error",
        description: "Failed to delete variation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading variations...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Product Variations</span>
          {!isAddingNew && (
            <Button
              size="sm"
              type="button"
              onClick={() => setIsAddingNew(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Variation
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAddingNew && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={newVariation.variation_type}
                  onValueChange={(value) =>
                    setNewVariation({ ...newVariation, variation_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Color</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="model">Model</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="style">Style</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value</Label>
                <Input
                  value={newVariation.variation_value || ""}
                  onChange={(e) =>
                    setNewVariation({ ...newVariation, variation_value: e.target.value })
                  }
                  placeholder="e.g., Red, XL, Cotton"
                />
              </div>
              {newVariation.variation_type === "color" && (
                <div>
                  <Label>Color Hex</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={newVariation.hex_color || "#000000"}
                      onChange={(e) =>
                        setNewVariation({ ...newVariation, hex_color: e.target.value })
                      }
                      className="w-20"
                    />
                    <Input
                      value={newVariation.hex_color || ""}
                      onChange={(e) =>
                        setNewVariation({ ...newVariation, hex_color: e.target.value })
                      }
                      placeholder="#FF0000"
                    />
                  </div>
                </div>
              )}
              <div>
                <Label>Display Label</Label>
                <Input
                  value={newVariation.variation_label || ""}
                  onChange={(e) =>
                    setNewVariation({ ...newVariation, variation_label: e.target.value })
                  }
                  placeholder="Optional display name"
                />
              </div>
              <div>
                <Label>Price Adjustment</Label>
                <Input
                  type="number"
                  value={newVariation.price_adjustment || 0}
                  onChange={(e) =>
                    setNewVariation({
                      ...newVariation,
                      price_adjustment: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
                <span className="text-xs text-muted-foreground">
                  Final: PKR {(basePrice + (newVariation.price_adjustment || 0)).toLocaleString()}
                </span>
              </div>
              <div>
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  value={newVariation.stock_quantity || 0}
                  onChange={(e) =>
                    setNewVariation({
                      ...newVariation,
                      stock_quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={handleAddVariation}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingNew(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {variations.map((variation) => {
            const isEditing = editingVariation?.id === variation.id;

            if (isEditing) {
              return (
                <div key={variation.id} className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={editingVariation.variation_value}
                        onChange={(e) =>
                          setEditingVariation({
                            ...editingVariation,
                            variation_value: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Price Adjustment</Label>
                      <Input
                        type="number"
                        value={editingVariation.price_adjustment}
                        onChange={(e) =>
                          setEditingVariation({
                            ...editingVariation,
                            price_adjustment: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Stock Quantity</Label>
                      <Input
                        type="number"
                        value={editingVariation.stock_quantity}
                        onChange={(e) =>
                          setEditingVariation({
                            ...editingVariation,
                            stock_quantity: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => handleUpdateVariation(variation.id!)}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingVariation(null)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={variation.id}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div className="flex items-center gap-4">
                  {variation.variation_type === "color" && variation.hex_color && (
                    <ColorSwatch
                      color={variation.variation_value}
                      hex={variation.hex_color}
                      size="sm"
                    />
                  )}
                  <div>
                    <span className="font-medium">
                      {variation.variation_label || variation.variation_value}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({variation.variation_type})
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Stock: {variation.stock_quantity}</span>
                    {variation.price_adjustment !== 0 && (
                      <span>
                        {variation.price_adjustment > 0 ? "+" : ""}
                        PKR {variation.price_adjustment.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => setEditingVariation(variation)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => handleDeleteVariation(variation.id!)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default VariationManager;