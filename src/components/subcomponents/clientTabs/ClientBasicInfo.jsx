import React from 'react'

const ClientBasicInfo = ({ item, open }) => {
  const Field = ({ label, value }) => (
    <div style={{
      background: '#13102C',
      borderRadius: '8px',
      padding: '10px 13px',
      border: '0.5px solid #2D2460',
    }}>
      <label style={{
        display: 'block',
        fontSize: '11px',
        fontWeight: 500,
        color: '#6B5FA0',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        marginBottom: '5px',
      }}>
        {label}
      </label>
      <p style={{
        margin: 0,
        fontSize: '13px',
        fontWeight: 500,
        color: value ? '#DDD6FF' : '#3D3560',
        fontStyle: value ? 'normal' : 'italic',
      }}>
        {value || 'N/A'}
      </p>
    </div>
  )

  const GroupHeader = ({ title }) => (
    <div style={{
      fontSize: '11px',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#9B8EC4',
      paddingBottom: '10px',
      marginBottom: '14px',
      borderBottom: '0.5px solid #2D2460',
    }}>
      {title}
    </div>
  )

  const grid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '10px',
  }

  const group = { marginBottom: '26px' }

  return (
    <div style={{
      background: '#191526',
      border: '1px solid #2D2460',
      borderRadius: '14px',
      padding: '24px 28px',
    }}>

      {/* ── Contact ── */}
      <div style={group}>
        <GroupHeader title="Contact" />
        <div style={grid}>
          <Field label="Company / Client name" value={item.clientName} />
          <Field label="Primary contact name"  value={item.secondName === '' ? null : item.primaryContact} />
          <Field label="Email"                 value={item.email} />
          <Field label="Website"               value={item.websiteAddress} />
          <Field label="Phone"                 value={item.phone} />
          <Field label="Cell"                  value={item.cell} />
          <Field label="Fax"                   value={item.fax} />
        </div>
      </div>

      {/* ── Address ── */}
      <div style={group}>
        <GroupHeader title="Address" />
        <div style={grid}>
          <Field label="Address 1" value={item.address1} />
          <Field label="Address 2" value={item.address2} />
          <Field label="City"      value={item.city} />
          <Field label="State"     value={item.state} />
          <Field label="Zip code"  value={item.zipCode} />
        </div>
      </div>

      {/* ── Assignment ── */}
      <div style={group}>
        <GroupHeader title="Assignment" />
        <div style={grid}>
          <Field label="Territory"         value={item.territory} />
          <Field label="Territory manager" value={item.territoryManager?.name} />
          <Field label="Assigned to"       value={item.assignedTo?.name} />
          <Field label="Assigned by"       value={item.assignee?.name} />
        </div>
      </div>

      {/* ── Client need ── */}
      <div style={group}>
        <GroupHeader title="Client need" />
        <div style={grid}>
          <Field label="Need category"
            value={`${item.needCategory.categoryName} ${item.needCategory.categoryCode}`} />
          <Field label="Need sub-category"
            value={`${item.needCategory.subCategory.subCategoryName} ${item.needCategory.subCategory.subCategoryCode}`} />
        </div>
      </div>

      {/* ── Badges ── */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        paddingTop: '18px',
        borderTop: '0.5px solid #2D2460',
      }}>
        <span style={{
          background: '#0C2318', color: '#4ADE80',
          fontSize: '11px', fontWeight: 500,
          padding: '4px 11px', borderRadius: '99px',
          border: '0.5px solid #166534',
        }}>
          Lead status: {item.leadStatus}
        </span>
        <span style={{
          background: '#1C1548', color: '#C4B5FD',
          fontSize: '11px', fontWeight: 500,
          padding: '4px 11px', borderRadius: '99px',
          border: '0.5px solid #3C3080',
        }}>
          Category · {item.needCategory.categoryCode}
        </span>
        <span style={{
          background: '#0C1929', color: '#93C5FD',
          fontSize: '11px', fontWeight: 500,
          padding: '4px 11px', borderRadius: '99px',
          border: '0.5px solid #1E3A5F',
        }}>
          Sub-category · {item.needCategory.subCategory.subCategoryCode}
        </span>
      </div>

    </div>
  )
}

export default ClientBasicInfo