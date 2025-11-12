import React, { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import {
  LogOutIcon,
  Volume2Icon,
  VolumeOffIcon,
  EyeIcon,
  ImageIcon,
  XIcon,
} from "lucide-react";
import ProfileImageModal from "./modals/ProfileImageModal";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

const ProfileHeader = () => {
  const { updateProfile, authUser, isUpdatingProfile, checkAuth } =
    useAuthStore();
  const { isSoundEnabled, toggleSound, selectedImage, setSelectedImage, setViewingProfile } =
    useChatStore();

  const fileInputRef = useRef();

  const handleViewProfile = () => {
    document.getElementById("profile_image_modal").showModal();
  };

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

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with Dropdown */}
          <div className="avatar online dropdown dropdown-hover dropdown-bottom">
            <div
              tabIndex={0}
              role="button"
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

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/50 group-hover:opacity-100" />

              {/* Loading Spinner */}
              {isUpdatingProfile && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                </div>
              )}
            </div>

            {/* Dropdown Menu */}
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-slate-800 rounded-box z-[1] w-48 p-2 shadow-lg border border-slate-700"
            >
              <li>
                <button
                  onClick={handleViewProfile}
                  className="text-slate-200 hover:bg-slate-700"
                >
                  <EyeIcon className="size-4" />
                  See Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="text-slate-200 hover:bg-slate-700"
                >
                  <ImageIcon className="size-4" />
                  Change Profile
                </button>
              </li>
            </ul>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Username & online text */}
          <button
            onClick={() => {
              setViewingProfile({ user: authUser, isOwnProfile: true });
            }}
            className="text-left hover:opacity-80 transition-opacity"
          >
            <h3 className="text-base font-medium text-slate-200 max-w-[180px] truncate cursor-pointer">
              {authUser.fullName}
            </h3>
            <p className="text-xs text-slate-400">Online</p>
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          {/* Logout Button */}
          <button
            onClick={() => {
              document.getElementById("logout_modal").showModal();
            }}
            className="transition-colors text-slate-400 hover:text-slate-200 lg:tooltip"
            data-tip="Logout"
          >
            <LogOutIcon className="size-5" />
          </button>

          {/* Sound Toggle Button */}
          <button
            className="transition-colors text-slate-400 hover:text-slate-200 lg:tooltip"
            onClick={() => {
              // play click sound before toggling
              mouseClickSound.currentTime = 0; // reset to start
              mouseClickSound
                .play()
                .catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
            data-tip={isSoundEnabled ? "Turn off" : "Turn on"}
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
