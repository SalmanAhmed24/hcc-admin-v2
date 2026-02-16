import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Github,
  Globe,
} from 'lucide-react';

const SocialMediaForm = ({ formData, onChange, errors }) => {
  const platforms = [
    {
      id: 'linkedIn',
      label: 'LinkedIn',
      placeholder: 'https://linkedin.com/in/username',
      icon: Linkedin,
      color: 'text-blue-600',
    },
    {
      id: 'twitter',
      label: 'Twitter',
      placeholder: 'https://twitter.com/username',
      icon: Twitter,
      color: 'text-sky-500',
    },
    {
      id: 'facebook',
      label: 'Facebook',
      placeholder: 'https://facebook.com/username',
      icon: Facebook,
      color: 'text-blue-700',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      placeholder: 'https://instagram.com/username',
      icon: Instagram,
      color: 'text-pink-600',
    },
    {
      id: 'github',
      label: 'GitHub',
      placeholder: 'https://github.com/username',
      icon: Github,
      color: 'text-gray-800',
    },
    {
      id: 'website',
      label: 'Website',
      placeholder: 'https://yourwebsite.com',
      icon: Globe,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="space-y-4">
      {platforms.map((platform) => {
        const Icon = platform.icon;
        return (
          <div key={platform.id} className="space-y-2">
            <Label htmlFor={platform.id} className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${platform.color}`} />
              {platform.label}
            </Label>
            <Input
              id={platform.id}
              type="url"
              value={formData[platform.id] || ''}
              onChange={(e) => onChange(platform.id, e.target.value)}
              placeholder={platform.placeholder}
              className={errors[platform.id] ? 'border-destructive' : 'bg-[#0F0A1F] border-[#1b172b] '}
            />
            {errors[platform.id] && (
              <p className="text-sm text-destructive">{errors[platform.id]}</p>
            )}
          </div>
        );
      })}

      <p className="text-xs text-muted-foreground mt-4">
        Enter the full URL including https://
      </p>
    </div>
  );
};

export default SocialMediaForm;