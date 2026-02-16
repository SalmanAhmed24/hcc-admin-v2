"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Globe,
  MessageCircle,
  Building2,
  Calendar,
  Tag,
} from "lucide-react";
import SendEmailViaGmail from "../subcomponents/drawers/mailingDrawer";

export default function ContactSidebar({ contact, onUpdate }) {
  const [openBulkMailModal, setOpenBulkMailModal] = useState(false);
  const openEmail = () => {
    setOpenBulkMailModal(true);
    // window.location.href = `mailto:${contact.basicInfo?.email}`;
  };

  const openPhone = () => {
    window.location.href = `tel:${contact.basicInfo?.phone}`;
  };

  const openWhatsApp = () => {
    const phone = contact.basicInfo?.phone?.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  const openLinkedIn = () => {
    if (contact.socialMedia?.linkedIn) {
      window.open(contact.social.linkedIn, "_blank");
    }
  };

  const openTwitter = () => {
    if (contact.socialMedia?.twitter) {
      const handle = contact.socialMedia.twitter.replace("@", "");
      window.open(`https://twitter.com/${handle}`, "_blank");
    }
  };

  const openWebsite = () => {
    if (contact.socialMedia?.website) {
      window.open(contact.socialMedia.website, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#231C46] border-[#2D2640] p-4">
        <h3 className="text-white font-semibold mb-4">Contact Information</h3>
        
        <div className="space-y-3">
          {contact.basicInfo?.email && (
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-gray-400 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">Email</p>
                <p className="text-sm text-white break-all">
                  {contact.basicInfo.email}
                </p>
              </div>
            </div>
          )}

          {contact.basicInfo?.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Phone</p>
                <p className="text-sm text-white">{contact.basicInfo.phone}</p>
              </div>
            </div>
          )}

          {contact.basicInfo?.mobilePhone && (
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Mobile</p>
                <p className="text-sm text-white">
                  {contact.basicInfo.mobilePhone}
                </p>
              </div>
            </div>
          )}

          {contact.address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Address</p>
                <p className="text-sm text-white">
                  {contact.address.street && `${contact.address.street}, `}
                  {contact.address.city && `${contact.address.city}, `}
                  {contact.address.state} {contact.address.postalCode}
                  {contact.address.country && `, ${contact.address.country}`}
                </p>
              </div>
            </div>
          )}

          {contact.professional?.company?.name && (
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Company</p>
                <p className="text-sm text-white">
                  {contact.professional.company.name}
                </p>
                {contact.professional.company.industry && (
                  <p className="text-xs text-gray-500">
                    {contact.professional.company.industry}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-[#231C46] border-[#2D2640] p-4">
        <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={openEmail}
            variant="outline"
            size="sm"
            className="border-[#2D2640] bg-[#6D28D9] text-gray-300 hover:bg-[#1F1833]"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>

          {contact.basicInfo?.phone && (
            <Button
              onClick={openPhone}
              variant="outline"
              size="sm"
              className="border-[#2D2640] bg-[#6D28D9] text-gray-300 hover:bg-[#1F1833]"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          )}

          {contact.basicInfo?.phone && (
            <Button
              onClick={openWhatsApp}
              variant="outline"
              size="sm"
              className="border-[#2D2640] bg-[#6D28D9] text-gray-300 hover:bg-[#1F1833]"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          )}

          {contact.socialMedia?.linkedIn && (
            <Button
              onClick={openLinkedIn}
              variant="outline"
              size="sm"
              className="border-[#2D2640] bg-[#6D28D9] text-gray-300 hover:bg-[#1F1833]"
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
          )}

          {contact.socialMedia?.twitter && (
            <Button
              onClick={openTwitter}
              variant="outline"
              size="sm"
              className="border-[#2D2640] bg-[#6D28D9] text-gray-300 hover:bg-[#2D2640]"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
          )}

          {contact.socialMedia?.website && (
            <Button
              onClick={openWebsite}
              variant="outline"
              size="sm"
              className="border-[#2D2640] bg-[#6D28D9] text-gray-300 hover:bg-[#1F1833]"
            >
              <Globe className="h-4 w-4 mr-2" />
              Website
            </Button>
          )}
        </div>
      </Card>
      <Card className="bg-[#231C46] border-[#2D2640] p-4">
        <h3 className="text-white font-semibold mb-4">Lifecycle</h3>
        
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Stage</p>
            <Badge className="bg-[#7C3AED] text-white">
              {contact.lifeCycle?.stage?.replace(/([A-Z])/g, " $1") || "Lead"}
            </Badge>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">Status</p>
            <Badge variant="outline" className="text-gray-300 border-gray-600">
              {contact.lifeCycle?.leadStatus || "New"}
            </Badge>
          </div>

          {contact.lifeCycle?.source && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Source</p>
              <p className="text-sm text-white capitalize">
                {contact.lifeCycle.source}
              </p>
            </div>
          )}

          {contact.lifeCycle?.becameLeadDate && (
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Became Lead</p>
                <p className="text-sm text-white">
                  {new Date(contact.lifeCycle.becameLeadDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {contact.lifeCycle?.tags && contact.lifeCycle.tags.length > 0 && (
        <Card className="bg-[#231C46] border-[#2D2640] p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {contact.lifecycle.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-[#2D2640] text-gray-300 border-[#3D3350]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {contact.metadata?.owner && (
        <Card className="bg-[#231C46] border-[#2D2640] p-4">
          <h3 className="text-white font-semibold mb-4">Contact Owner</h3>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#7C3AED] flex items-center justify-center text-white font-semibold">
              {contact.metadata.owner.firstName?.charAt(0)}
              {contact.metadata.owner.lastName?.charAt(0)}
            </div>
            <div>
              <p className="text-sm text-white font-medium">
                {contact.metadata.owner.firstName}{" "}
                {contact.metadata.owner.lastName}
              </p>
              <p className="text-xs text-gray-400">
                {contact.metadata.owner.email}
              </p>
            </div>
          </div>
        </Card>
      )}
      {openBulkMailModal ? (
          <SendEmailViaGmail
            open={openBulkMailModal}
            handleClose={() => setOpenBulkMailModal(false)}
            email={contact.basicInfo?.email}
            recipientName={`${contact.basicInfo?.firstName} ${contact.basicInfo?.lastName}`}
          />
      ) : null}
    </div>
  );
}