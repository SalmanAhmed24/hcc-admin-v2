import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_CONTACT_BY_ID } from '../../../graphql/contactQueries';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Briefcase,
  MapPin,
  Share2,
  Edit,
  Mail,
  Phone,
  Building,
  AlertCircle,
} from 'lucide-react';

import EditDrawer from './EditDrawer';
import BasicInfoSection from './sections/BasicInfoSection';
import ProfessionalSection from './sections/ProfessionalSection';
import AddressSection from './sections/AddressSection';
import SocialMediaSection from './sections/SocialMediaSection';

const Info = ({ contactId, newContact, onUpdate }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [initialData, setInitialData] = useState(null);

  const { data, loading, error, refetch } = useQuery(GET_CONTACT_BY_ID, {
      variables: { id: contactId },
      fetchPolicy: "cache-and-network",
      skip: !contactId
    });  

  const contact = data?.getContact || newContact;

  const handleEdit = (section, data) => {
    setEditSection(section);
    setInitialData(data);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditSection(null);
    setInitialData(null);
  };

  const handleSuccess = () => {
    refetch();
    handleCloseDrawer();
  };

  if (!contactId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Select a contact to view details</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading contact: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!contact) {
    return (
      <Alert className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Contact not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-[#231C46] border-[#2D2640]">
     <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-300">{contact.basicInfo.firstName} {contact.basicInfo.lastName}</h1>
          <p className="text-muted-foreground text-gray-300">
            {contact.professional?.jobTitle || 'No job title'}{' '}
            {contact.professional?.company?.name && (
              <>at {contact.professional.company.name}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              contact.lifeCycle?.status === 'active'
                ? 'bg-green-100 text-green-800'
                : contact.lifeCycle?.status === 'inactive'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {contact.lifeCycle?.status}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {contact.lifeCycle?.stage}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <Card className="w-full bg-[#0F0A1F] border-[#2D2640]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground text-gray-200">Email</p>
                <p className="font-medium text-gray-200">{contact.basicInfo.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full bg-[#0F0A1F] border-[#2D2640]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground text-gray-200">Phone</p>
                <p className="font-medium text-gray-200">
                  {contact.basicInfo.phone || 'No phone'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full bg-[#0F0A1F] border-[#2D2640]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground text-gray-200">Company</p>
                <p className="font-medium text-gray-200">
                  {contact.professional?.company?.name || 'No company'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="w-full bg-[#0F0A1F] border-[#2D2640]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-200">
              <User className="h-5 w-5 text-gray-200" />
              Basic Information
            </CardTitle>
            <CardDescription className="text-gray-200">Personal contact details</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit('basicInfo', contact.basicInfo)}
            className="text-gray-200"
          >
            <Edit className="h-4 w-4 mr-2 text-gray-200" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="text-gray-200">
          <BasicInfoSection data={contact.basicInfo} />
        </CardContent>
      </Card>
      <Card className="w-full bg-[#0F0A1F] border-[#2D2640]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-200">
              <Briefcase className="h-5 w-5 text-gray-200" />
              Professional Details
            </CardTitle>
            <CardDescription className="text-gray-200">Work and career information</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit('professional', contact.professional)}
            className="text-gray-200"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="text-gray-200">
          <ProfessionalSection data={contact.professional} />
        </CardContent>
      </Card>
      <Card className="w-full bg-[#0F0A1F] border-[#2D2640]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-200">
              <MapPin className="h-5 w-5" />
              Address
            </CardTitle>
            <CardDescription className="text-gray-200">Location and timezone</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit('address', contact.address)}
            className="text-gray-200"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="text-gray-200">
          <AddressSection data={contact.address} />
        </CardContent>
      </Card>
      <Card className="w-full bg-[#0F0A1F] border-[#2D2640]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-200">
              <Share2 className="h-5 w-5 text-gray-200" />
              Social Media
            </CardTitle>
            <CardDescription className="text-gray-200">Online profiles and links</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit('socialMedia', contact.socialMedia)}
            className="text-gray-200"
          >
            <Edit className="h-4 w-4 mr-2 text-gray-200" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="text-gray-200">
          <SocialMediaSection data={contact.socialMedia} />
        </CardContent>
      </Card>
      <EditDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        section={editSection}
        initialData={initialData}
        contactId={contactId}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Info;