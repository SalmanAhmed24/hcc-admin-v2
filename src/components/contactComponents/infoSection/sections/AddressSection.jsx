import React from 'react';

const AddressSection = ({ data }) => {
  if (!data) {
    return <p className="text-muted-foreground text-sm">No data available</p>;
  }

  const formatAddress = () => {
    const parts = [];
    if (data.street) parts.push(data.street);
    if (data.street2) parts.push(data.street2);
    
    const cityStateZip = [];
    if (data.city) cityStateZip.push(data.city);
    if (data.state) cityStateZip.push(data.state);
    if (data.postalCode) cityStateZip.push(data.postalCode);
    
    if (cityStateZip.length > 0) {
      parts.push(cityStateZip.join(', '));
    }
    
    if (data.country) parts.push(data.country);
    
    return parts.join('\n');
  };

  const fullAddress = formatAddress();

  const fields = [
    {
      label: 'Street Address',
      value: data.street,
    },
    {
      label: 'Street Address 2',
      value: data.street2,
    },
    {
      label: 'City',
      value: data.city,
    },
    {
      label: 'State / Province',
      value: data.state,
    },
    {
      label: 'Postal Code',
      value: data.postalCode,
    },
    {
      label: 'Country',
      value: data.country,
    },
    {
      label: 'Timezone',
      value: data.timezone,
    },
  ];

  return (
    <div className="space-y-6 ">
      {fullAddress && (
        <div className="p-4 rounded-lg bg-[#0F0A1F] border-[#4e4866]">
          <label className="text-sm font-medium text-muted-foreground ">
            Complete Address
          </label>
          <p className="mt-2 text-sm whitespace-pre-line ">{fullAddress}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field, index) => (
          <div key={index}>
            <label className="text-sm font-medium text-muted-foreground">
              {field.label}
            </label>
            {field.value ? (
              <p className="mt-1 text-sm">{field.value}</p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Not provided</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressSection;