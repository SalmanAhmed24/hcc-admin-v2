import React from 'react';

const BasicInfoSection = ({ data }) => {
  if (!data) {
    return <p className="text-muted-foreground text-sm">No data available</p>;
  }

  const fields = [
    {
      label: 'Full Name',
      value: `${data.salutation ? data.salutation + ' ' : ''}${data.firstName} ${data.lastName}`,
    },
    {
      label: 'Preferred Name',
      value: data.preferredName,
    },
    {
      label: 'Email',
      value: data.email,
      type: 'email',
    },
    {
      label: 'Alternate Email',
      value: data.alternateEmail,
      type: 'email',
    },
    {
      label: 'Phone',
      value: data.phone,
      type: 'tel',
    },
    {
      label: 'Mobile Phone',
      value: data.mobilePhone,
      type: 'tel',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field, index) => (
        <div key={index}>
          <label className="text-sm font-medium text-muted-foreground">
            {field.label}
          </label>
          {field.value ? (
            field.type === 'email' ? (
              <a
                href={`mailto:${field.value}`}
                className="block mt-1 text-sm text-blue-600 hover:underline"
              >
                {field.value}
              </a>
            ) : field.type === 'tel' ? (
              <a
                href={`tel:${field.value}`}
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
  );
};

export default BasicInfoSection;