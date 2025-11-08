import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

const ContactsList = () => {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } =
    useChatStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className="p-4 transition-colors rounded-lg cursor-pointer bg-cyan-500/10 hover:bg-cyan-500/20"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            {/* todo: fix this online status and make it work with socket */}
            <div className="avatar online">
              <div className="rounded-full size-12">
                <img
                  src={contact?.profilePic || "/avatar.png"}
                  alt={contact?.fullName}
                />
              </div>
            </div>
            <h4 className="font-medium truncate text-slate-200">
              {contact?.fullName}
            </h4>
          </div>
        </div>
      ))}
    </>
  );
};

export default ContactsList;
