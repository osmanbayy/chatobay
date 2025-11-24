/* eslint-disable react-hooks/rules-of-hooks */
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { ArrowLeft, MailIcon, PhoneIcon, UserIcon, Trash2Icon, XIcon, ImageIcon } from "lucide-react";
import { LoaderIcon } from "react-hot-toast";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";

const MAX_ABOUT_LENGTH = 500;

const OnlineStatus = ({ userId }) => {
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(userId);
  return (
    <p className="mb-6 text-sm text-slate-400">
      {isOnline ? "Online" : "Offline"}
    </p>
  );
};

const ProfilePage = () => {
  const { viewingProfile, setViewingProfile } = useChatStore();
  const { deleteAccount, updateProfile, isUpdatingProfile } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [pendingImage, setPendingImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const fileInputRef = useRef(null);

  if (!viewingProfile) return null;

  const { user, isOwnProfile } = viewingProfile;

  useEffect(() => {
    if (!isOwnProfile) return;
    setAboutText(user?.about || "");
    setPreviewImage(user?.profilePic || "");
    setPendingImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [isOwnProfile, user?._id, user?.about, user?.profilePic]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setViewingProfile(null);
    } catch (error) {
      // Error handled in store
      console.error("Error deleting account: ", error);
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleClose = () => {
    setViewingProfile(null);
  };

  const handleStartEditing = () => {
    if (!isOwnProfile) return;
    setIsEditing(true);
    setAboutText(user?.about || "");
    setPreviewImage(user?.profilePic || "");
    setPendingImage("");
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setAboutText(user?.about || "");
    setPreviewImage(user?.profilePic || "");
    setPendingImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error("Profile picture must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewImage(reader.result?.toString() || "");
      setPendingImage(reader.result?.toString() || "");
      setIsEditing(true);
    };
  };

  const handleSaveProfile = async () => {
    if (!isOwnProfile) return;

    const trimmedAbout = aboutText.trim();
    if (trimmedAbout.length > MAX_ABOUT_LENGTH) {
      toast.error(`About must be ${MAX_ABOUT_LENGTH} characters or fewer.`);
      return;
    }

    const existingAbout = (user?.about || "").trim();
    const aboutChanged = trimmedAbout !== existingAbout;
    const imageChanged = Boolean(pendingImage);

    if (!aboutChanged && !imageChanged) {
      toast.error("No changes to save.");
      return;
    }

    const payload = {};
    if (aboutChanged) payload.about = trimmedAbout;
    if (imageChanged) payload.profilePic = pendingImage;

    try {
      const updatedUser = await updateProfile(payload);
      if (updatedUser) {
        setIsEditing(false);
        setPendingImage("");
        setPreviewImage(updatedUser?.profilePic || "");
        setViewingProfile({ user: updatedUser, isOwnProfile: true });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch {
      // errors handled via toast inside store
      console.error("Error updating profile.");
    }
  };

  const profileImageSrc = isOwnProfile ? (previewImage || "/avatar.png") : (user?.profilePic || "/avatar.png");
  const normalizedAbout = aboutText.trim();
  const originalAbout = (user?.about || "").trim();
  const hasPendingChanges = (normalizedAbout !== originalAbout) || Boolean(pendingImage);

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="p-2 transition-colors rounded-full hover:bg-slate-700/30 md:hidden"
            aria-label="Back"
          >
            <ArrowLeft className="size-5 text-slate-300" />
          </button>
          <h2 className="text-lg font-semibold text-slate-200">Profile</h2>
        </div>
        <button
          onClick={handleClose}
          className="items-center justify-center hidden p-2 transition-colors border border-transparent rounded-full md:flex hover:border-slate-500"
          aria-label="Close"
        >
          <XIcon className="size-5 text-slate-400 hover:text-slate-200" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-6 py-8">
          {/* Profile Picture */}
          <div className="relative mb-6">
            <div className="w-32 h-32 overflow-hidden border-2 rounded-full border-slate-700">
              <img
                src={profileImageSrc}
                alt={user?.fullName}
                className="object-cover w-full h-full"
              />
            </div>
            {isOwnProfile && (
              <div className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 border-2 rounded-full bg-cyan-500 border-slate-900">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          {isOwnProfile && (
            <div className="flex flex-col items-center w-full max-w-md gap-3 mb-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                type="button"
                className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg border-slate-600 text-slate-200 hover:bg-slate-800/70"
              >
                <ImageIcon className="w-4 h-4" />
                Change photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {!isEditing && (
                <p className="text-xs text-slate-500">Use the button above to select a new profile picture.</p>
              )}
            </div>
          )}

          {/* Name */}
          <h3 className="mb-2 text-2xl font-semibold text-slate-100">{user?.fullName}</h3>

          {/* Online Status */}
          {!isOwnProfile && (
            <OnlineStatus userId={user?._id} />
          )}

          {/* Info Cards */}
          <div className="w-full max-w-md space-y-4">
            {/* Email */}
            <div className="p-4 border rounded-lg bg-slate-800/50 border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/50">
                  <MailIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium uppercase text-slate-400">Email</p>
                  <p className="mt-1 text-sm truncate text-slate-200">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Phone */}
            {user?.phone && (
              <div className="p-4 border rounded-lg bg-slate-800/50 border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/50">
                    <PhoneIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium uppercase text-slate-400">Phone</p>
                    <p className="mt-1 text-sm text-slate-200">{user.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* About */}
            {isOwnProfile ? (
              <div className="p-4 border rounded-lg bg-slate-800/50 border-slate-700/50">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/50">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium uppercase text-slate-400">About</p>
                      {!isEditing && (
                        <button
                          onClick={handleStartEditing}
                          type="button"
                          className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <>
                        <textarea
                          value={aboutText}
                          onChange={(event) => setAboutText(event.target.value)}
                          rows={4}
                          maxLength={MAX_ABOUT_LENGTH}
                          placeholder="Tell others a little about yourself..."
                          className="w-full p-3 text-sm transition border rounded-lg resize-none bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                        />
                        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                          <span>
                            {aboutText.length}/{MAX_ABOUT_LENGTH}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelEditing}
                              type="button"
                              className="px-3 py-1 transition-colors border rounded-lg border-slate-600 text-slate-200 hover:bg-slate-700/70"
                              disabled={isUpdatingProfile}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveProfile}
                              type="button"
                              disabled={!hasPendingChanges || isUpdatingProfile}
                              className="flex items-center gap-2 px-4 py-1 text-sm font-medium transition-colors rounded-lg text-slate-900 bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isUpdatingProfile ? (
                                <LoaderIcon className="w-4 h-4 animate-spin" />
                              ) : (
                                "Save changes"
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap text-slate-200">
                        {user?.about || "Add a short bio so others know who you are."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              user?.about && (
                <div className="p-4 border rounded-lg bg-slate-800/50 border-slate-700/50">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/50">
                      <UserIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="mb-1 text-xs font-medium uppercase text-slate-400">About</p>
                      <p className="text-sm whitespace-pre-wrap text-slate-200">{user.about}</p>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Delete Account Button (only for own profile) */}
            {isOwnProfile && (
              <div className="pt-4 mt-6 border-t border-slate-700/50">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full px-4 py-3 text-sm font-medium text-red-400 transition-colors border rounded-lg border-red-400/30 hover:bg-red-400/10"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Trash2Icon className="w-4 h-4" />
                      Delete Account
                    </div>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-center text-slate-300">
                      Are you sure you want to delete your account? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 text-sm font-medium transition-colors border rounded-lg border-slate-600 text-slate-300 hover:bg-slate-700/50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? (
                          <LoaderIcon className="w-4 h-4 mx-auto animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

