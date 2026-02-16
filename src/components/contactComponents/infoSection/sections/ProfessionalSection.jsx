import React from 'react';
import { Badge } from '@/components/ui/badge';

const ProfessionalSection = ({ data }) => {
  if (!data) {
    return <p className="text-muted-foreground text-sm">No data available</p>;
  }

  const fields = [
    {
      label: 'Job Title',
      value: data.jobTitle,
    },
    {
      label: 'Department',
      value: data.department,
    },
    {
      label: 'Company',
      value: data.company?.name,
    },
    {
      label: 'Company Domain',
      value: data.company?.domain,
      type: 'url',
    },
    {
      label: 'Industry',
      value: data.company?.industry,
    },
    {
      label: 'Seniority Level',
      value: data.seniority,
    },
    {
      label: 'Years of Experience',
      value: data.yearsOfExperience ? `${data.yearsOfExperience} years` : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field, index) => (
          <div key={index}>
            <label className="text-sm font-medium text-muted-foreground">
              {field.label}
            </label>
            {field.value ? (
              field.type === 'url' ? (
                <a
                  href={`https://${field.value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-sm text-blue-600 hover:underline"
                >
                  {field.value}
                </a>
              ) : (
                <p className="mt-1 text-sm">{field.value}</p>
              )
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Not provided</p>
            )}
          </div>
        ))}
      </div>

      {data.skills && data.skills.length > 0 && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Skills
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalSection;