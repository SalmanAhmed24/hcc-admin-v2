"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CONTACT_BY_ID } from "@/graphql/contactQueries";
import { DELETE_CONTACT } from "@/graphql/contactMutations";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trash2, Edit } from "lucide-react";
import Swal from "sweetalert2";
import ContactSidebar from "../../../../components/contactComponents/ContactSidebar";
import ActivityTimeline from "../../../../components/contactComponents/ActivityTimeline";
import DealsSection from "../../../../components/contactComponents/DealsSection";
import TicketsSection from "../../../../components/contactComponents/TicketsSelection";
import AttachmentsSection from "../../../../components/contactComponents/AttachmentsSection";
import IntelligenceSection from "../../../../components/contactComponents/IntelligenceSection";
import useAuthStore from "@/store/store";
import Info from "@/components/contactComponents/infoSection/Info";
import AddContactDrawer from "@/components/contactComponents/AddContactDrawer";

export default function ContactDetailPage() {
  const user = useAuthStore((state) => state.user);
  const params = useParams();
  const router = useRouter();
  const contactId = params.slug;
  const [activeTab, setActiveTab] = useState("Info");
  const [edit, setEdit] = useState(false);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  

    const { data, loading, error, refetch } = useQuery(GET_CONTACT_BY_ID, {
    variables: { id: contactId },
    fetchPolicy: "cache-and-network",
    skip: !contactId
  });
  console.log("Contact Data:", data);
  if (error) {
  console.log("GraphQL Error:", error.message);

}
      
useEffect(() => {
  console.log("=== DEBUG INFO ===");
  console.log("Contact ID:", contactId);
  console.log("Loading:", loading);
  console.log("Error:", error);
  console.log("Data:", data);
  console.log("Contact:", data?.contact);
}, [contactId, loading, error, data]);
  const [deleteContact] = useMutation(DELETE_CONTACT, {
    onCompleted: (result) => {
      if (result.deleteContact.success) {
        Swal.fire("Archived!", "Contact has been archived.", "success");
        router.push("/contacts");
      }
    },
    onError: (err) => {
      Swal.fire("Error", err.message, "error");
    },
  });

  const contact = data?.contact;

  const handleDeleteContact = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will archive the contact.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7C3AED",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, archive it",
    });

    if (result.isConfirmed) {
      deleteContact({ variables: { id: contactId } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0A1F] flex items-center justify-center">
        <div className="text-white">Loading contact...</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-[#0F0A1F] flex items-center justify-center">
        <div className="text-white">Contact not found</div>
      </div>
    );
  }

  const handleEditContact = (v) => {
    setEdit(true);
    setAddDrawerOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#0F0A1F]">
      <div className="bg-[#1A1625] border-b border-[#2D2640] sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/contacts")}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="h-12 w-12 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-lg font-semibold">
                {contact.basicInfo?.firstName?.charAt(0)}
                {contact.basicInfo?.lastName?.charAt(0)}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">
                  {contact.basicInfo?.firstName} {contact.basicInfo?.lastName}
                </h1>
                <p className="text-gray-400 text-sm">
                  {contact.professional?.jobTitle || "No title"}
                  {contact.professional?.company?.name &&
                    ` at ${contact.professional.company.name}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleEditContact}
                variant="outline"
                size="sm"
                className="border-[#2D2640] text-gray-300 hover:bg-white hover:text-black bg-[#6D28D9]"
              >
                <Edit  className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={handleDeleteContact}
                variant="outline"
                size="sm"
                className="border-red-900 text-red-400 hover:bg-white hover:text-black bg-[#6D28D9]"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Archive
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          <div className="w-80 flex-shrink-0">
            <ContactSidebar contact={contact} onUpdate={() => refetch()} />
          </div>
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-[#231C46] border-b border-[#2D2640] w-full justify-between rounded-t-lg h-auto p-0">
                {["Info", "activity", "deals", "tickets", "attachments", "intelligence"].map(
                  (tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#7C3AED] rounded-none px-5 py-3 text-gray-400 data-[state=active]:text-white capitalize"
                    >
                      {tab}
                    </TabsTrigger>
                  )
                )}
              </TabsList>
              <TabsContent value="Info" className="mt-0">
                <Info contactId={contactId} newContact={contact} onUpdate={() => refetch()} />
              </TabsContent>
              <TabsContent value="activity" className="mt-0">
                <ActivityTimeline contact={contact} onUpdate={() => refetch()} />
              </TabsContent>
              <TabsContent value="deals" className="mt-0">
                <DealsSection contact={contact} onUpdate={() => refetch()} />
              </TabsContent>
              <TabsContent value="tickets" className="mt-0">
                <TicketsSection contact={contact} onUpdate={() => refetch()} />
              </TabsContent>
              <TabsContent value="attachments" className="mt-0">
                <AttachmentsSection contact={contact} onUpdate={() => refetch()} />
              </TabsContent>
              <TabsContent value="intelligence" className="mt-0">
                <IntelligenceSection contact={contact} />
              </TabsContent>
            </Tabs>
          </div>
          <AddContactDrawer
           edit={edit}
           open={addDrawerOpen}
           contact={data?.contact}
           onClose={() => setAddDrawerOpen(false)}
           onSuccess={() => {
            setEdit(false)
            setAddDrawerOpen(false);
            refetch();
          }}
          />
        </div>
      </div>
    </div>
  );
}