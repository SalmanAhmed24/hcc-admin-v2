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
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const ProfessionalForm = ({ formData, onChange, onNestedChange, errors }) => {
  const seniorityLevels = [
    'EntryLevel',
    'MidLevel',
    'Senior',
    'Manager',
    'Director',
    'VP',
    'CLevel',
    'Owner',
  ];

  const [skillInput, setSkillInput] = React.useState('');

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
    onChange(
      'skills',
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  };

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
        
        <div className="space-y-2">
          <Input
            id="companyName"
            value={formData.company?.name || ''}
            onChange={(e) => onNestedChange('company', 'name', e.target.value)}
            placeholder="Company Name"
            className="bg-[#0F0A1F] border-[#2D2640]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="companyDomain"
            value={formData.company?.domain || ''}
            onChange={(e) =>
              onNestedChange('company', 'domain', e.target.value)
            }
            placeholder="company.com"
            className="bg-[#0F0A1F] border-[#2D2640]"
          />

          <Input
            id="companyIndustry"
            value={formData.company?.industry || ''}
            onChange={(e) =>
              onNestedChange('company', 'industry', e.target.value)
            }
            placeholder="Technology"
            className="bg-[#0F0A1F] border-[#2D2640]"
          />
        </div>
      </div>

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
            <SelectContent >
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
            onChange={(e) =>
              onChange('yearsOfExperience', e.target.value)
            }
            placeholder="5"
            className="bg-[#0F0A1F] border-[#2D2640]"
          />
        </div>
      </div>

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
        <p className="text-xs text-muted-foreground ">
          Press Enter to add a skill
        </p>
        
        {formData.skills && formData.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="gap-1 bg-[#0F0A1F] border-[#2D2640] text-white">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 hover:bg-destructive/20 rounded-full bg-[#0F0A1F] border-[#2D2640]"
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