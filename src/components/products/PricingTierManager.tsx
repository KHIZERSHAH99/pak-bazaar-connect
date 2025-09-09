import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Save, 
  Edit2, 
  X,
  TrendingDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePricingTiers } from '@/hooks/usePricingTiers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PricingTierManagerProps {
  productId: string;
  basePrice: number;
  onUpdate?: () => void;
}

const PricingTierManager: React.FC<PricingTierManagerProps> = ({
  productId,
  basePrice,
  onUpdate
}) => {
  const { tiers, loading, createTier, updateTier, deleteTier } = usePricingTiers(productId);
  const { toast } = useToast();
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [deletingTier, setDeletingTier] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const [formData, setFormData] = useState({
    min_quantity: 1,
    max_quantity: null as number | null,
    unit_price: basePrice
  });

  const [editFormData, setEditFormData] = useState({
    min_quantity: 1,
    max_quantity: null as number | null,
    unit_price: basePrice
  });

  const handleAddTier = async () => {
    if (!formData.min_quantity || !formData.unit_price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await createTier({
        product_id: productId,
        min_quantity: formData.min_quantity,
        max_quantity: formData.max_quantity,
        unit_price: formData.unit_price
      });
      
      toast({
        title: "Success",
        description: "Pricing tier added successfully"
      });
      
      setIsAddingNew(false);
      setFormData({
        min_quantity: 1,
        max_quantity: null,
        unit_price: basePrice
      });
      
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add pricing tier",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTier = async (tierId: string) => {
    try {
      await updateTier(tierId, editFormData);
      
      toast({
        title: "Success",
        description: "Pricing tier updated successfully"
      });
      
      setEditingTier(null);
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pricing tier",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    try {
      await deleteTier(tierId);
      
      toast({
        title: "Success",
        description: "Pricing tier deleted successfully"
      });
      
      setDeletingTier(null);
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete pricing tier",
        variant: "destructive"
      });
    }
  };

  const startEdit = (tier: any) => {
    setEditingTier(tier.id);
    setEditFormData({
      min_quantity: tier.min_quantity,
      max_quantity: tier.max_quantity,
      unit_price: tier.unit_price
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            Pricing Tiers Management
          </div>
          {!isAddingNew && (
            <Button
              size="sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAddingNew(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Tier
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Tier Form */}
        {isAddingNew && (
          <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
            <div className="font-medium text-sm">Add New Pricing Tier</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="new-min">Min Quantity</Label>
                <Input
                  id="new-min"
                  type="number"
                  min="1"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({
                    ...formData,
                    min_quantity: parseInt(e.target.value) || 1
                  })}
                />
              </div>
              <div>
                <Label htmlFor="new-max">Max Quantity (optional)</Label>
                <Input
                  id="new-max"
                  type="number"
                  min={formData.min_quantity + 1}
                  value={formData.max_quantity || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    max_quantity: e.target.value ? parseInt(e.target.value) : null
                  })}
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <Label htmlFor="new-price">Unit Price (PKR)</Label>
                <Input
                  id="new-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({
                    ...formData,
                    unit_price: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddTier();
                }}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsAddingNew(false);
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Existing Tiers */}
        <div className="space-y-2">
          {tiers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingDown className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pricing tiers defined yet</p>
              <p className="text-sm mt-1">Add tiers to offer bulk discounts</p>
            </div>
          ) : (
            tiers.map((tier) => (
              <div key={tier.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                {editingTier === tier.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Min Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={editFormData.min_quantity}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            min_quantity: parseInt(e.target.value) || 1
                          })}
                        />
                      </div>
                      <div>
                        <Label>Max Quantity</Label>
                        <Input
                          type="number"
                          min={editFormData.min_quantity + 1}
                          value={editFormData.max_quantity || ''}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            max_quantity: e.target.value ? parseInt(e.target.value) : null
                          })}
                          placeholder="Unlimited"
                        />
                      </div>
                      <div>
                        <Label>Unit Price (PKR)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editFormData.unit_price}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            unit_price: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUpdateTier(tier.id);
                        }}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingTier(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="font-medium">
                          {tier.max_quantity 
                            ? `${tier.min_quantity} - ${tier.max_quantity}`
                            : `${tier.min_quantity}+`
                          } units
                        </span>
                      </div>
                      <div>
                        <Badge variant="secondary">
                          PKR {tier.unit_price.toLocaleString()} per unit
                        </Badge>
                      </div>
                      {tier.unit_price < basePrice && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          {((basePrice - tier.unit_price) / basePrice * 100).toFixed(0)}% off
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startEdit(tier);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeletingTier(tier.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTier} onOpenChange={() => setDeletingTier(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pricing Tier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this pricing tier? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingTier && handleDeleteTier(deletingTier)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default PricingTierManager;
