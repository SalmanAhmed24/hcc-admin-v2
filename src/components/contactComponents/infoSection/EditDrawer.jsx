import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  UPDATE_BASIC_INFO,
  UPDATE_PROFESSIONAL,
  UPDATE_ADDRESS,
  UPDATE_SOCIAL_MEDIA,
} from '../../../graphql/contactMutations';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

import BasicInfoForm from './forms/BasicInfoForm';
import ProfessionalForm from './forms/ProfessionalForm';
import AddressForm from './forms/AddressForm';
import SocialMediaForm from './forms/SocialMediaForm';

const EditDrawer = ({
  open,
  onClose,
  section,
  initialData,
  contactId,
  onSuccess,
}) => {

  console.log(contactId);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const [updateBasicInfo, { loading: loadingBasicInfo }] = useMutation(
    UPDATE_BASIC_INFO
  );
  const [updateProfessional, { loading: loadingProfessional }] = useMutation(
    UPDATE_PROFESSIONAL
  );
  const [updateAddress, { loading: loadingAddress }] = useMutation(
    UPDATE_ADDRESS
  );
  const [updateSocialMedia, { loading: loadingSocialMedia }] = useMutation(
    UPDATE_SOCIAL_MEDIA
  );

  const isLoading =
    loadingBasicInfo ||
    loadingProfessional ||
    loadingAddress ||
    loadingSocialMedia;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData || {});
    }
  }, [initialData]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setSuccessMessage('');
    }
  }, [open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (section === 'basicInfo') {
      if (!formData.firstName?.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName?.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.email?.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      let mutation;
      let variables;

      switch (section) {
        case 'basicInfo':
          mutation = updateBasicInfo;
          variables = {
            id: contactId,
            basicInfo :  {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone || null,
              mobilePhone: formData.mobilePhone || null,
              alternateEmail: formData.alternateEmail || null,
              preferredName: formData.preferredName || null,
              salutation: formData.salutation || null,
            },
          };
          break;

        case 'professional':
          mutation = updateProfessional;
          variables = {
            id: contactId,
            professional : {
              jobTitle: formData.jobTitle || null,
              department: formData.department || null,
              company: formData.company
                ? {
                    id: formData.company?.id || null,
                    name: formData.company?.name || null,
                    domain: formData.company?.domain || null,
                    industry: formData.company?.industry || null,
                  }
                : null,
              seniority: formData.seniority || null,
              yearsOfExperience: formData.yearsOfExperience
                ? parseInt(formData.yearsOfExperience)
                : null,
              skills: formData.skills || [],
            },
          };
          break;

        case 'address':
          mutation = updateAddress;
          variables = {
            id: contactId,
            address: {
              street: formData.street || null,
              street2: formData.street2 || null,
              city: formData.city || null,
              state: formData.state || null,
              postalCode: formData.postalCode || null,
              country: formData.country || null,
              timezone: formData.timezone || null,
            },
          };
          break;

        case 'socialMedia':
          mutation = updateSocialMedia;
          variables = {
            id: contactId,
            socialMedia: {
              linkedIn: formData.linkedIn || null,
              twitter: formData.twitter || null,
              facebook: formData.facebook || null,
              instagram: formData.instagram || null,
              github: formData.github || null,
              website: formData.website || null,
            },
          };
          break;

        default:
          throw new Error('Invalid section');
      }

      const { data } = await mutation({ variables });

      if (data) {
        setSuccessMessage('Changes saved successfully!');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      setErrors({
        submit: error.message || 'Failed to update contact. Please try again.',
      });
    }
  };

  const getTitle = () => {
    switch (section) {
      case 'basicInfo':
        return 'Edit Basic Information';
      case 'professional':
        return 'Edit Professional Details';
      case 'address':
        return 'Edit Address';
      case 'socialMedia':
        return 'Edit Social Media';
      default:
        return 'Edit Contact';
    }
  };

  const getDescription = () => {
    switch (section) {
      case 'basicInfo':
        return 'Update personal contact information';
      case 'professional':
        return 'Update work and career details';
      case 'address':
        return 'Update location and address information';
      case 'socialMedia':
        return 'Update social media profiles and links';
      default:
        return 'Update contact information';
    }
  };

  const renderForm = () => {
    switch (section) {
      case 'basicInfo':
        return (
          <BasicInfoForm
            formData={formData}
            onChange={handleChange}
            errors={errors}
          />
        );
      case 'professional':
        return (
          <ProfessionalForm
            formData={formData}
            onChange={handleChange}
            onNestedChange={handleNestedChange}
            errors={errors}
          />
        );
      case 'address':
        return (
          <AddressForm
            formData={formData}
            onChange={handleChange}
            errors={errors}
          />
        );
      case 'socialMedia':
        return (
          <SocialMediaForm
            formData={formData}
            onChange={handleChange}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto bg-[#231C46] text-white">
        <SheetHeader>
          <SheetTitle className="text-white">{getTitle()}</SheetTitle>
          <SheetDescription>{getDescription()}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {renderForm()}

          <SheetFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="bg-[#0F0A1F] border-[#1b172b] text-white" 
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#7C3AED] hover:bg-[#6D28D9] border-[#1b172b]">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default EditDrawer;