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

const BasicInfoForm = ({ formData, onChange, errors }) => {
  const salutations = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 ">
          <Label htmlFor="salutation">Salutation</Label>
          <Select
            value={formData.salutation || ''}
            onValueChange={(value) => onChange('salutation', value)}
            
          >
            <SelectTrigger className="bg-[#0F0A1F] border-[#2D2640]">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {salutations.map((sal) => (
                <SelectItem key={sal} value={sal}>
                  {sal}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            value={formData.firstName || ''}
            onChange={(e) => onChange('firstName', e.target.value)}
            className={errors.firstName ? 'border-destructive' : 'bg-[#0F0A1F] border-[#2D2640]'}
            placeholder="John"
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            value={formData.lastName || ''}
            onChange={(e) => onChange('lastName', e.target.value)}
            className={errors.lastName ? 'border-destructive' : 'bg-[#0F0A1F] border-[#2D2640]'}
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredName">Preferred Name</Label>
        <Input
          id="preferredName"
          value={formData.preferredName || ''}
          onChange={(e) => onChange('preferredName', e.target.value)}
          placeholder="Johnny"
          className="bg-[#0F0A1F] border-[#2D2640]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          className={errors.email ? 'border-destructive' : 'bg-[#0F0A1F] border-[#2D2640]'}
          placeholder="john.doe@example.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="alternateEmail">Alternate Email</Label>
        <Input
          id="alternateEmail"
          type="email"
          value={formData.alternateEmail || ''}
          onChange={(e) => onChange('alternateEmail', e.target.value)}
          placeholder="john@personal.com"
          className="bg-[#0F0A1F] border-[#2D2640]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="bg-[#0F0A1F] border-[#2D2640]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobilePhone">Mobile Phone</Label>
          <Input
            id="mobilePhone"
            type="tel"
            value={formData.mobilePhone || ''}
            onChange={(e) => onChange('mobilePhone', e.target.value)}
            placeholder="+1 (555) 987-6543"
            className="bg-[#0F0A1F] border-[#2D2640]"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;