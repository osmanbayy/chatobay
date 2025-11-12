import React from "react";
import { Check, CheckCheck } from "lucide-react";

const MessageStatus = ({ isRead, isDelivered }) => {

  if (isRead) {
    return (
      <CheckCheck className="w-4 h-4 text-blue-700" />
    );
  } else if (isDelivered) {
    return (
      <CheckCheck className="w-4 h-4 text-slate-600" />
    );
  } else {
    return (
      <Check className="w-4 h-4 text-slate-400" />
    );
  }
};

export default MessageStatus;

