import { XIcon } from "lucide-react";
import React from "react";

const ProfileImageModal = ({ selectedImage, authUser }) => {
  return (
    <dialog id="profile_image_modal" className="z-50 bg-transparent">
      <div className="w-full max-w-5xl p-0 overflow-hidden bg-black backdrop-blur-lg modal-box">
        <form method="dialog">
          <button className="absolute z-10 text-white btn btn-sm btn-circle btn-ghost right-2 top-2 hover:bg-slate-800">
            <XIcon size={20} />
          </button>
        </form>
        <div className="flex items-center justify-center p-8 min-h-[400px]">
          <img
            src={selectedImage || authUser.profilePic || "/avatar.png"}
            alt="Profile"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
          />
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default ProfileImageModal;
