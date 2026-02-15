import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AddressForm = ({ formData, onChange, errors }) => {
  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Australia/Sydney',
    'UTC',
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={formData.street || ''}
          onChange={(e) => onChange('street', e.target.value)}
          placeholder="123 Main Street"
          className="bg-[#0F0A1F] border-[#1b172b]" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="street2">Street Address 2</Label>
        <Input
          id="street2"
          value={formData.street2 || ''}
          onChange={(e) => onChange('street2', e.target.value)}
          placeholder="Apt 4B, Suite 200, etc."
          className="bg-[#0F0A1F] border-[#1b172b]" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city || ''}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="San Francisco"
            className="bg-[#0F0A1F] border-[#1b172b]" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State / Province</Label>
          <Input
            id="state"
            value={formData.state || ''}
            onChange={(e) => onChange('state', e.target.value)}
            placeholder="CA"
            className="bg-[#0F0A1F] border-[#1b172b]" 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={formData.postalCode || ''}
            onChange={(e) => onChange('postalCode', e.target.value)}
            placeholder="94102"
            className="bg-[#0F0A1F] border-[#1b172b]"          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country || ''}
            onChange={(e) => onChange('country', e.target.value)}
            placeholder="USA"
            className="bg-[#0F0A1F] border-[#1b172b]" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select
          value={formData.timezone || ''}
          onValueChange={(value) => onChange('timezone', value)}
        >
          <SelectTrigger className="bg-[#0F0A1F] border-[#1b172b]">
            <SelectValue placeholder="Select timezone..." />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AddressForm;