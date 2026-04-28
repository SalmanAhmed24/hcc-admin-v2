import React from 'react'

const ClientBasicInfo = ({ item, open }) => {
  const Field = ({ label, value }) => (
    <div style={{
      background: 'var(--color-background-secondary, #f7f7f5)',
      borderRadius: '8px',
      padding: '10px 14px',
      borderLeft: '2.5px solid #AFA9EC'
    }}>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: 600,
        color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px'
      }}>
        {label}
      </label>
      <p style={{
        margin: 0, fontSize: '14px', fontWeight: 500,
        color: value ? '#1a1a1a' : '#aaa',
        fontStyle: value ? 'normal' : 'italic'
      }}>
        {value || 'N/A'}
      </p>
    </div>
  )

  const GroupHeader = ({ title }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      marginBottom: '14px', paddingBottom: '8px',
      borderBottom: '1.5px solid #EEEDFE'
    }}>
      <span style={{
        fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: '#534AB7'
      }}>
        {title}
      </span>
    </div>
  )

  const grid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px 24px'
  }

  const group = { marginBottom: '24px' }

  return (
    <div style={{
      background: '#fff', border: '0.5px solid #e5e5e0',
      borderRadius: '12px', padding: '24px 28px'
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

      {/* ── Assignment ──
          CHANGED: territoryManager, assignedTo, and assignee are now
          UserRef objects { id: ObjectId, name: string } on the model.
          Read the .name snapshot for display — do not render the whole object.

          item.territoryManager.name  (was: item.territoryManager)
          item.assignedTo.name        (was: item.assignedTo)
          item.assignee.name          (was: item.assignee)
      */}
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
        display: 'flex', gap: '8px', flexWrap: 'wrap',
        marginTop: '20px', paddingTop: '18px',
        borderTop: '0.5px solid #e5e5e0'
      }}>
        <span style={{ background: '#E1F5EE', color: '#085041', fontSize: '12px', fontWeight: 500, padding: '4px 12px', borderRadius: '99px' }}>
          Lead status: {item.leadStatus}
        </span>
        <span style={{ background: '#EEEDFE', color: '#3C3489', fontSize: '12px', fontWeight: 500, padding: '4px 12px', borderRadius: '99px' }}>
          Category · {item.needCategory.categoryCode}
        </span>
        <span style={{ background: '#E6F1FB', color: '#0C447C', fontSize: '12px', fontWeight: 500, padding: '4px 12px', borderRadius: '99px' }}>
          Sub-category · {item.needCategory.subCategory.subCategoryCode}
        </span>
      </div>

    </div>
  )
}

export default ClientBasicInfo