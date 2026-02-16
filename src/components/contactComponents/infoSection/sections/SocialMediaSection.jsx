import React from 'react';
import {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Github,
  Globe,
  ExternalLink,
} from 'lucide-react';

const SocialMediaSection = ({ data }) => {
  if (!data) {
    return <p className="text-muted-foreground text-sm">No data available</p>;
  }

  const platforms = [
    {
      label: 'LinkedIn',
      value: data.linkedIn,
      icon: Linkedin,
      color: 'text-blue-600',
    },
    {
      label: 'Twitter',
      value: data.twitter,
      icon: Twitter,
      color: 'text-sky-500',
    },
    {
      label: 'Facebook',
      value: data.facebook,
      icon: Facebook,
      color: 'text-blue-700',
    },
    {
      label: 'Instagram',
      value: data.instagram,
      icon: Instagram,
      color: 'text-pink-600',
    },
    {
      label: 'GitHub',
      value: data.github,
      icon: Github,
      color: 'text-gray-800',
    },
    {
      label: 'Website',
      value: data.website,
      icon: Globe,
      color: 'text-green-600',
    },
  ];

  const hasAnyData = platforms.some((platform) => platform.value);

  if (!hasAnyData) {
    return (
      <p className="text-muted-foreground text-sm">
        No social media profiles added
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {platforms.map((platform, index) => {
        const Icon = platform.icon;
        
        if (!platform.value) {
          return (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-dashed">
              <Icon className={`h-5 w-5 ${platform.color} opacity-30`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {platform.label}
                </p>
                <p className="text-xs text-muted-foreground">Not provided</p>
              </div>
            </div>
          );
        }

        return (
          <a
            key={index}
            href={platform.value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
          >
            <Icon className={`h-5 w-5 ${platform.color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{platform.label}</p>
              <p className="text-xs text-muted-foreground truncate">
                {platform.value}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        );
      })}
    </div>
  );
};

export default SocialMediaSection;