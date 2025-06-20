
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BudgetControlsProps {
  budgetCap: string;
  dailyBudgetLimit: string;
  campaignDays: string;
  onBudgetCapChange: (value: string) => void;
  onDailyBudgetLimitChange: (value: string) => void;
  onCampaignDaysChange: (value: string) => void;
  errors: { budget_cap?: string; daily_budget_limit?: string };
  isSubmitting: boolean;
}

const BudgetControls: React.FC<BudgetControlsProps> = ({
  budgetCap,
  dailyBudgetLimit,
  campaignDays,
  onBudgetCapChange,
  onDailyBudgetLimitChange,
  onCampaignDaysChange,
  errors,
  isSubmitting
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budget_cap">Total Budget Cap (PKR) *</Label>
          <Input
            id="budget_cap"
            name="budget_cap"
            type="number"
            min="100"
            value={budgetCap}
            onChange={(e) => onBudgetCapChange(e.target.value)}
            placeholder="e.g. 1000"
            disabled={isSubmitting}
          />
          {errors.budget_cap && <p className="text-sm text-destructive mt-1">{errors.budget_cap}</p>}
        </div>
        
        <div>
          <Label htmlFor="daily_budget_limit">Daily Budget Limit (PKR)</Label>
          <Input
            id="daily_budget_limit"
            name="daily_budget_limit"
            type="number"
            min="50"
            value={dailyBudgetLimit}
            onChange={(e) => onDailyBudgetLimitChange(e.target.value)}
            placeholder="Optional"
            disabled={isSubmitting}
          />
          {errors.daily_budget_limit && <p className="text-sm text-destructive mt-1">{errors.daily_budget_limit}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="campaign_days">Campaign Duration</Label>
        <Select value={campaignDays} onValueChange={onCampaignDaysChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Days</SelectItem>
            <SelectItem value="14">14 Days</SelectItem>
            <SelectItem value="30">30 Days</SelectItem>
            <SelectItem value="60">60 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default BudgetControls;
