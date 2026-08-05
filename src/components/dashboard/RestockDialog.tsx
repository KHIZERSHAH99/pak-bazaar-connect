import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Package } from 'lucide-react';

interface RestockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: { id: string; name: string; stock_quantity: number | null } | null;
}

const RestockDialog: React.FC<RestockDialogProps> = ({ open, onOpenChange, product }) => {
  const [mode, setMode] = useState<'add' | 'set'>('add');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!product || !quantity) return;
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      toast({ title: 'Invalid quantity', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const prevStock = product.stock_quantity || 0;
    const newStock = mode === 'add' ? prevStock + qty : qty;
    const change = newStock - prevStock;

    const { data: updated, error } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', product.id)
      .select('id, stock_quantity');

    if (error) {
      setLoading(false);
      toast({ title: 'Failed to update stock', description: error.message, variant: 'destructive' });
      return;
    }

    if (!updated || updated.length === 0) {
      setLoading(false);
      toast({
        title: 'Stock not updated',
        description: 'You do not have permission to update this product, or it no longer exists.',
        variant: 'destructive',
      });
      return;
    }

    // Log the stock movement
    const { data: { user } } = await supabase.auth.getUser();
    const { error: movementError } = await supabase.from('stock_movements').insert({
      product_id: product.id,
      quantity_change: change,
      previous_quantity: prevStock,
      new_quantity: newStock,
      reason: 'manual_restock',
      created_by: user?.id,
    });
    if (movementError) console.error('Stock movement log failed:', movementError);

    setLoading(false);
    toast({ title: 'Stock updated', description: `${product.name} now has ${updated[0].stock_quantity} units` });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] }),
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] }),
      queryClient.invalidateQueries({ queryKey: ['products'] }),
      queryClient.invalidateQueries({ queryKey: ['wholesaler-products'] }),
    ]);
    onOpenChange(false);
    setQuantity('');
    setMode('add');
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md font-poppins">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Restock: {product.name}
          </DialogTitle>
          <DialogDescription>
            Current stock: <span className="font-semibold">{product.stock_quantity ?? 0}</span> units
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'add' | 'set')} className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="add" id="add" />
              <Label htmlFor="add">Add to stock</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="set" id="set" />
              <Label htmlFor="set">Set stock to</Label>
            </div>
          </RadioGroup>

          <div>
            <Label htmlFor="qty">{mode === 'add' ? 'Quantity to add' : 'New stock quantity'}</Label>
            <Input
              id="qty"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={mode === 'add' ? 'e.g. 50' : 'e.g. 200'}
              className="mt-1"
            />
            {mode === 'add' && quantity && !isNaN(parseInt(quantity)) && (
              <p className="text-xs text-muted-foreground mt-1">
                New total: {(product.stock_quantity || 0) + parseInt(quantity)} units
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !quantity}>
            {loading ? 'Updating...' : 'Update Stock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RestockDialog;
