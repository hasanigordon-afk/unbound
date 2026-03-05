import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ChannelList from "./ChannelList";
import ChannelChat from "./ChannelChat";

export default function GroupChannelsTab({ userEmail }) {
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeMembership, setActiveMembership] = useState(null);

  const { data: memberships = [] } = useQuery({
    queryKey: ["my-channel-memberships", userEmail],
    queryFn: () => base44.entities.GroupChannelMember.filter({ member_email: userEmail }),
    enabled: !!userEmail,
  });

  const handleSelectChannel = (channel, membership) => {
    setActiveChannel(channel);
    setActiveMembership(membership);
  };

  const handleBack = () => {
    setActiveChannel(null);
    setActiveMembership(null);
  };

  if (activeChannel && activeMembership) {
    return (
      <ChannelChat
        channel={activeChannel}
        membership={activeMembership}
        userEmail={userEmail}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="p-4 max-w-xl">
      <div className="mb-4">
        <h2 className="text-base font-semibold mb-1" style={{ color: "#1E1E1E" }}>Community Channels</h2>
        <p className="text-xs" style={{ color: "#5A5A5A" }}>
          Join moderated, anonymous channels to connect with others on the same journey.
        </p>
      </div>
      <ChannelList
        userEmail={userEmail}
        onSelectChannel={handleSelectChannel}
        activeMemberships={memberships}
      />
    </div>
  );
}