"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Mail,
  Phone,
  Video,
  DollarSign,
  AlertCircle,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function IntelligenceSection({ contact }) {
  const intelligence = contact.intelligence || {};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const getSentimentColor = (sentiment) => {
    const colors ={
                    positive: "text-green-400",
                    neutral: "text-gray-400",
                    negative: "text-red-400",
                    };
                    return colors[sentiment] || "text-gray-400";
                    };
                    const getSentimentBg = (sentiment) => {
                    const colors = {
                    positive: "bg-green-500/20 border-green-500",
                    neutral: "bg-gray-500/20 border-gray-500",
                    negative: "bg-red-500/20 border-red-500",
                    };
                    return colors[sentiment] || "bg-gray-500/20 border-gray-500";
                    };
    return (
        <div className="bg-[#231C46] rounded-lg border border-[#2D2640] p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
                Intelligence & Insights
            </h2>
            <p className="text-sm text-gray-400 mt-1">
                    AI-powered analytics and engagement metrics
            </p>
          </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card className="bg-[#0F0A1F] border-[#2D2640] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#7C3AED]" />
          Engagement Score
        </h3>
        <span className="text-2xl font-bold text-[#7C3AED]">
          {intelligence.engagementScore || 0}
        </span>
      </div>
      <Progress
        value={intelligence.engagementScore || 0}
        className="h-2 bg-[#2D2640]"
      />
      <p className="text-xs text-gray-400 mt-2">
        Based on activity frequency and recency
      </p>
    </Card>
    <Card className="bg-[#0F0A1F] border-[#2D2640] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-500" />
          Response Rate
        </h3>
        <span className="text-2xl font-bold text-blue-500">
          {intelligence.responseRate || 0}%
        </span>
      </div>
      <Progress
        value={intelligence.responseRate || 0}
        className="h-2 bg-[#2D2640]"
      />
      <p className="text-xs text-gray-400 mt-2">
        Inbound vs outbound communication ratio
      </p>
    </Card>

    <Card className="bg-[#0F0A1F] border-[#2D2640] p-4 md:col-span-2">
      <h3 className="text-white font-semibold mb-4">Activity Breakdown</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Mail className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {intelligence.activityCounts?.emails || 0}
            </p>
            <p className="text-xs text-gray-400">Emails</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Phone className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {intelligence.activityCounts?.calls || 0}
            </p>
            <p className="text-xs text-gray-400">Calls</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Video className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {intelligence.activityCounts?.meetings || 0}
            </p>
            <p className="text-xs text-gray-400">Meetings</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {intelligence.activityCounts?.notes || 0}
            </p>
            <p className="text-xs text-gray-400">Notes</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Clock className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {intelligence.activityCounts?.tasks || 0}
            </p>
            <p className="text-xs text-gray-400">Tasks</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-500/20 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {intelligence.activityCounts?.total || 0}
            </p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
        </div>
      </div>
    </Card>
    <Card className="bg-[#0F0A1F] border-[#2D2640] p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-green-500" />
        Deal Performance
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Total Deals</span>
          <span className="text-white font-semibold">
            {intelligence.dealMetrics?.totalDeals || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Open Deals</span>
          <span className="text-white font-semibold">
            {intelligence.dealMetrics?.openDeals || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Won Deals</span>
          <span className="text-green-400 font-semibold">
            {intelligence.dealMetrics?.wonDeals || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Total Value</span>
          <span className="text-white font-semibold">
            {formatCurrency(intelligence.dealMetrics?.totalValue)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-[#2D2640]">
          <span className="text-gray-400 text-sm">Won Value</span>
          <span className="text-green-400 font-bold">
            {formatCurrency(intelligence.dealMetrics?.wonValue)}
          </span>
        </div>
      </div>
    </Card>
    <Card className="bg-[#0F0A1F] border-[#2D2640] p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-orange-500" />
        Support Metrics
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Total Tickets</span>
          <span className="text-white font-semibold">
            {intelligence.ticketMetrics?.totalTickets || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Open Tickets</span>
          <span className="text-orange-400 font-semibold">
            {intelligence.ticketMetrics?.openTickets || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Resolved</span>
          <span className="text-green-400 font-semibold">
            {intelligence.ticketMetrics?.resolvedTickets || 0}
          </span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-[#2D2640]">
          <span className="text-gray-400 text-sm">Avg. Resolution</span>
          <span className="text-white font-semibold">
            {intelligence.ticketMetrics?.averageResolutionTime || 0}h
          </span>
        </div>
      </div>
    </Card>
    <Card className="bg-[#0F0A1F] border-[#2D2640] p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-blue-500" />
        Recent Activity
      </h3>
      <div className="space-y-3">
        {intelligence.lastActivityDate && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Last Activity</p>
            <p className="text-sm text-white">
              {formatDistanceToNow(new Date(intelligence.lastActivityDate), {
                addSuffix: true,
              })}
            </p>
          </div>
        )}
        {intelligence.lastEmailDate && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Last Email</p>
            <p className="text-sm text-white">
              {formatDistanceToNow(new Date(intelligence.lastEmailDate), {
                addSuffix: true,
              })}
            </p>
          </div>
        )}
        {intelligence.lastCallDate && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Last Call</p>
            <p className="text-sm text-white">
              {formatDistanceToNow(new Date(intelligence.lastCallDate), {
                addSuffix: true,
              })}
            </p>
          </div>
        )}
        {intelligence.lastMeetingDate && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Last Meeting</p>
            <p className="text-sm text-white">
              {formatDistanceToNow(new Date(intelligence.lastMeetingDate), {
                addSuffix: true,
              })}
            </p>
          </div>
        )}
      </div>
    </Card>
    <Card className="bg-[#0F0A1F] border-[#2D2640] p-4">
      <h3 className="text-white font-semibold mb-4">Insights</h3>
      <div className="space-y-4">
        {intelligence.preferredContactMethod && (
          <div>
            <p className="text-xs text-gray-400 mb-2">
              Preferred Contact Method
            </p>
            <div className="inline-flex items-center gap-2 bg-[#7C3AED]/20 border border-[#7C3AED] rounded-full px-3 py-1">
              <span className="text-sm text-[#7C3AED] capitalize">
                {intelligence.preferredContactMethod}
              </span>
            </div>
          </div>
        )}

        {intelligence.sentiment && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Sentiment</p>
            <div
              className={`inline-flex items-center gap-2 ${getSentimentBg(
                intelligence.sentiment
              )} border rounded-full px-3 py-1`}
            >
              <span
                className={`text-sm ${getSentimentColor(
                  intelligence.sentiment
                )} capitalize font-semibold`}
              >
                {intelligence.sentiment}
              </span>
            </div>
          </div>
        )}

        {intelligence.bestTimeToContact && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Best Time to Contact</p>
            <p className="text-sm text-white">
              {intelligence.bestTimeToContact.dayOfWeek} at{" "}
              {intelligence.bestTimeToContact.hourOfDay}:00
            </p>
          </div>
        )}
      </div>
    </Card>
  </div>
</div>
);
}

