import React, { useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { LogOutIcon, Volume2Icon, VolumeOffIcon } from "lucide-react";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

const ProfileHeader = () => {
  const { logout, updateProfile, authUser, isUpdatingProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImage, setSelectedImage] = useState(null);

  const fileInputRef = useRef();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar online">
            <button
              onClick={() => fileInputRef.current.click()}
              className="relative overflow-hidden rounded-full size-14 group"
            >
              {/* Profile image */}
              <img
                src={selectedImage || authUser.profilePic || "/avatar.png"}
                alt="User image"
                className={`object-cover size-full transition-opacity ${
                  isUpdatingProfile ? "opacity-50 blur-[1px]" : ""
                }`}
              />

              {/* Hover Change text */}
              <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/50 group-hover:opacity-100">
                <span className="text-xs text-white">Change</span>
              </div>

              {/* Loading Spinner */}
              {isUpdatingProfile && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                </div>
              )}
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Username & online text */}
          <div>
            <h3 className="text-base font-medium text-slate-200 max-w-[180px] truncate">
              {authUser.fullName}
            </h3>
            <p className="text-xs text-slate-400">Online</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          {/* Logout Button */}
          <button
            onClick={logout}
            className="transition-colors text-slate-400 hover:text-slate-200"
          >
            <LogOutIcon className="size-5" />
          </button>

          {/* Sound Toggle Button */}
          <button
            className="transition-colors text-slate-400 hover:text-slate-200"
            onClick={() => {
              // play click sound before toggling
              mouseClickSound.currentTime = 0; // reset to start
              mouseClickSound
                .play()
                .catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
