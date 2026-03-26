// import React from 'react';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { X } from 'lucide-react';

// const ProfessionalForm = ({ formData, onChange, onNestedChange, errors }) => {
//   const seniorityLevels = [
//     'EntryLevel',
//     'MidLevel',
//     'Senior',
//     'Manager',
//     'Director',
//     'VP',
//     'CLevel',
//     'Owner',
//   ];

//   const [skillInput, setSkillInput] = React.useState('');

//   const handleAddSkill = (e) => {
//     if (e.key === 'Enter' && skillInput.trim()) {
//       e.preventDefault();
//       const currentSkills = formData.skills || [];
//       if (!currentSkills.includes(skillInput.trim())) {
//         onChange('skills', [...currentSkills, skillInput.trim()]);
//       }
//       setSkillInput('');
//     }
//   };

//   const handleRemoveSkill = (skillToRemove) => {
//     const currentSkills = formData.skills || [];
//     onChange(
//       'skills',
//       currentSkills.filter((skill) => skill !== skillToRemove)
//     );
//   };

//   return (
//     <div className="space-y-4">
//       <div className="space-y-2">
//         <Label htmlFor="jobTitle">Job Title</Label>
//         <Input
//           id="jobTitle"
//           value={formData.jobTitle || ''}
//           onChange={(e) => onChange('jobTitle', e.target.value)}
//           placeholder="Software Engineer"
//           className="bg-[#0F0A1F] border-[#2D2640]"
//         />
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="department">Department</Label>
//         <Input
//           id="department"
//           value={formData.department || ''}
//           onChange={(e) => onChange('department', e.target.value)}
//           placeholder="Engineering"
//           className="bg-[#0F0A1F] border-[#2D2640]"
//         />
//       </div>

//       <div className="space-y-3">
//         <Label>Company Information</Label>
        
//         <div className="space-y-2">
//           <Input
//             id="companyName"
//             value={formData.company?.name || ''}
//             onChange={(e) => onNestedChange('company', 'name', e.target.value)}
//             placeholder="Company Name"
//             className="bg-[#0F0A1F] border-[#2D2640]"
//           />
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <Input
//             id="companyDomain"
//             value={formData.company?.domain || ''}
//             onChange={(e) =>
//               onNestedChange('company', 'domain', e.target.value)
//             }
//             placeholder="company.com"
//             className="bg-[#0F0A1F] border-[#2D2640]"
//           />

//           <Input
//             id="companyIndustry"
//             value={formData.company?.industry || ''}
//             onChange={(e) =>
//               onNestedChange('company', 'industry', e.target.value)
//             }
//             placeholder="Technology"
//             className="bg-[#0F0A1F] border-[#2D2640]"
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="seniority">Seniority Level</Label>
//           <Select
//             value={formData.seniority || ''}
//             onValueChange={(value) => onChange('seniority', value)}
//           >
//             <SelectTrigger className="bg-[#0F0A1F] border-[#2D2640]">
//               <SelectValue placeholder="Select level..." />
//             </SelectTrigger>
//             <SelectContent >
//               {seniorityLevels.map((level) => (
//                 <SelectItem key={level} value={level}>
//                   {level.replace(/([A-Z])/g, ' $1').trim()}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="yearsOfExperience">Years of Experience</Label>
//           <Input
//             id="yearsOfExperience"
//             type="number"
//             min="0"
//             max="70"
//             value={formData.yearsOfExperience || ''}
//             onChange={(e) =>
//               onChange('yearsOfExperience', e.target.value)
//             }
//             placeholder="5"
//             className="bg-[#0F0A1F] border-[#2D2640]"
//           />
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="skills">Skills</Label>
//         <Input
//           id="skills"
//           value={skillInput}
//           onChange={(e) => setSkillInput(e.target.value)}
//           onKeyDown={handleAddSkill}
//           placeholder="Type a skill and press Enter"
//           className="bg-[#0F0A1F] border-[#2D2640]"
//         />
//         <p className="text-xs text-muted-foreground ">
//           Press Enter to add a skill
//         </p>
        
//         {formData.skills && formData.skills.length > 0 && (
//           <div className="flex flex-wrap gap-2 mt-2">
//             {formData.skills.map((skill, index) => (
//               <Badge key={index} variant="secondary" className="gap-1 bg-[#0F0A1F] border-[#2D2640] text-white">
//                 {skill}
//                 <button
//                   type="button"
//                   onClick={() => handleRemoveSkill(skill)}
//                   className="ml-1 hover:bg-destructive/20 rounded-full bg-[#0F0A1F] border-[#2D2640]"
//                 >
//                   <X className="h-3 w-3" />
//                 </button>
//               </Badge>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfessionalForm;

import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { apiPath } from '@/utils/routes';

const ProfessionalForm = ({ formData, onChange, onNestedChange, errors }) => {
  const seniorityLevels = [
    'EntryLevel', 'MidLevel', 'Senior', 'Manager',
    'Director', 'VP', 'CLevel', 'Owner',
  ];

  const [skillInput, setSkillInput] = useState('');

  // ── Debounce helper (no extra lib needed) ─────────────────────────
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      return new Promise((resolve) => {
        timer = setTimeout(() => resolve(fn(...args)), delay);
      });
    };
  };

  // ── Fetch companies from your REST endpoint ───────────────────────
  const fetchCompanies = async (inputValue) => {
  if (!inputValue || inputValue.trim().length < 2) return [];
  try {
    const res = await axios.get(
      `${apiPath.prodPath}/api/clients?search=${encodeURIComponent(inputValue.trim())}&limit=10`
    );

    if (res.status === 200) {
      const clients = res.data.clients || res.data.data || res.data || [];
      return clients.map((client) => ({
        value: client._id,
        label: client.clientName,
        domain: client.websiteAddress || '',
        industry: client.industry || '',
        name: client.clientName || '',
      }));
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return [];
  }
};

  // Debounced version handed to AsyncSelect
  const loadOptions = useCallback(
    debounce(fetchCompanies, 400),
    []
  );

  // ── When a company is picked from the dropdown ────────────────────
  const handleCompanySelect = (selectedOption) => {
    if (!selectedOption) {
      // Cleared — reset all company fields
      onNestedChange('company', 'id', '');
      onNestedChange('company', 'name', '');
      onNestedChange('company', 'domain', '');
      onNestedChange('company', 'industry', '');
      return;
    }
    onNestedChange('company', 'id', selectedOption.value);
    onNestedChange('company', 'name', selectedOption.name);
    onNestedChange('company', 'domain', selectedOption.domain);
    onNestedChange('company', 'industry', selectedOption.industry);
  };

  // ── Skills ────────────────────────────────────────────────────────
  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const currentSkills = formData.skills || [];
      if (!currentSkills.includes(skillInput.trim())) {
        onChange('skills', [...currentSkills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const currentSkills = formData.skills || [];
    onChange('skills', currentSkills.filter((s) => s !== skillToRemove));
  };

  // ── react-select dark theme styles ───────────────────────────────
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#0F0A1F',
      borderColor: state.isFocused ? '#7C3AED' : '#2D2640',
      boxShadow: state.isFocused ? '0 0 0 1px #7C3AED' : 'none',
      '&:hover': { borderColor: '#7C3AED' },
      minHeight: '40px',
      borderRadius: '6px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#1A1333',
      border: '1px solid #2D2640',
      borderRadius: '6px',
      zIndex: 50,
    }),
    menuList: (base) => ({
      ...base,
      padding: '4px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#2D2640' : 'transparent',
      color: state.isFocused ? '#fff' : '#d1d5db',
      borderRadius: '4px',
      cursor: 'pointer',
      padding: '8px 12px',
      fontSize: '14px',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#fff',
      fontSize: '14px',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6b7280',
      fontSize: '14px',
    }),
    input: (base) => ({
      ...base,
      color: '#fff',
      fontSize: '14px',
    }),
    loadingIndicator: (base) => ({
      ...base,
      color: '#7C3AED',
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#6b7280',
      '&:hover': { color: '#fff' },
      cursor: 'pointer',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#6b7280',
      '&:hover': { color: '#fff' },
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: '#2D2640',
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: '#6b7280',
      fontSize: '14px',
    }),
    loadingMessage: (base) => ({
      ...base,
      color: '#6b7280',
      fontSize: '14px',
    }),
  };

  // Build the current value object so react-select shows it as selected
  const currentCompanyValue =
    formData.company?.id && formData.company?.name
      ? {
          value: formData.company.id,
          label: formData.company.name,
        }
      : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input
          id="jobTitle"
          value={formData.jobTitle || ''}
          onChange={(e) => onChange('jobTitle', e.target.value)}
          placeholder="Software Engineer"
          className="bg-[#0F0A1F] border-[#2D2640]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          value={formData.department || ''}
          onChange={(e) => onChange('department', e.target.value)}
          placeholder="Engineering"
          className="bg-[#0F0A1F] border-[#2D2640]"
        />
      </div>

      <div className="space-y-3">
        <Label>Company Information</Label>

        <div className="space-y-1">
          <AsyncSelect
            cacheOptions
            loadOptions={loadOptions}
            onChange={handleCompanySelect}
            value={currentCompanyValue}
            isClearable
            placeholder="Search company by name..."
            loadingMessage={() => 'Searching...'}
            noOptionsMessage={({ inputValue }) =>
              inputValue.length < 2
                ? 'Type at least 2 characters...'
                : 'No companies found'
            }
            styles={selectStyles}
          />
          <p className="text-xs text-muted-foreground">
            Search and select a company to auto-fill details below
          </p>
        </div>

        {/* Auto-filled fields — still editable manually */}
        <div className="space-y-2">
          <Input
            value={formData.company?.name || ''}
            onChange={(e) => onNestedChange('company', 'name', e.target.value)}
            placeholder="Company Name"
            className="bg-[#0F0A1F] border-[#2D2640]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            value={formData.company?.domain || ''}
            onChange={(e) => onNestedChange('company', 'domain', e.target.value)}
            placeholder="company.com"
            className="bg-[#0F0A1F] border-[#2D2640]"
          />
          <Input
            value={formData.company?.industry || ''}
            onChange={(e) => onNestedChange('company', 'industry', e.target.value)}
            placeholder="Technology"
            className="bg-[#0F0A1F] border-[#2D2640]"
          />
        </div>

        {/* Hidden id indicator — shows the user which client is linked */}
        {formData.company?.id && (
          <p className="text-xs text-[#7C3AED]">
            Linked to client ID: {formData.company.name}
          </p>
        )}
      </div>

      {/* Seniority + Experience */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="seniority">Seniority Level</Label>
          <Select
            value={formData.seniority || ''}
            onValueChange={(value) => onChange('seniority', value)}
          >
            <SelectTrigger className="bg-[#0F0A1F] border-[#2D2640]">
              <SelectValue placeholder="Select level..." />
            </SelectTrigger>
            <SelectContent>
              {seniorityLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level.replace(/([A-Z])/g, ' $1').trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">Years of Experience</Label>
          <Input
            id="yearsOfExperience"
            type="number"
            min="0"
            max="70"
            value={formData.yearsOfExperience || ''}
            onChange={(e) => onChange('yearsOfExperience', e.target.value)}
            placeholder="5"
            className="bg-[#0F0A1F] border-[#2D2640]"
          />
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label htmlFor="skills">Skills</Label>
        <Input
          id="skills"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={handleAddSkill}
          placeholder="Type a skill and press Enter"
          className="bg-[#0F0A1F] border-[#2D2640]"
        />
        <p className="text-xs text-muted-foreground">Press Enter to add a skill</p>

        {formData.skills && formData.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="gap-1 bg-[#0F0A1F] border-[#2D2640] text-white"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 hover:bg-destructive/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalForm;