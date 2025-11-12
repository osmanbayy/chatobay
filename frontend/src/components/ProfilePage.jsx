import React from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { ArrowLeft, MailIcon, PhoneIcon, UserIcon, Trash2Icon, XIcon } from "lucide-react";
import { LoaderIcon } from "react-hot-toast";

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
  const { authUser, deleteAccount } = useAuthStore();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  if (!viewingProfile) return null;

  const { user, isOwnProfile } = viewingProfile;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setViewingProfile(null);
    } catch (error) {
      // Error handled in store
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleClose = () => {
    setViewingProfile(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
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
            <div className="w-32 h-32 overflow-hidden rounded-full border-2 border-slate-700">
              <img
                src={user?.profilePic || "/avatar.png"}
                alt={user?.fullName}
                className="object-cover w-full h-full"
              />
            </div>
            {isOwnProfile && (
              <div className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 bg-cyan-500 rounded-full border-2 border-slate-900">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="mb-2 text-2xl font-semibold text-slate-100">{user?.fullName}</h3>

          {/* Online Status */}
          {!isOwnProfile && (
            <OnlineStatus userId={user?._id} />
          )}

          {/* Info Cards */}
          <div className="w-full max-w-md space-y-4">
            {/* Email */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/50">
                  <MailIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-400 uppercase">Email</p>
                  <p className="mt-1 text-sm text-slate-200 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Phone */}
            {user?.phone && (
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/50">
                    <PhoneIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-400 uppercase">Phone</p>
                    <p className="mt-1 text-sm text-slate-200">{user.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* About */}
            {user?.about && (
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/50">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-400 uppercase mb-1">About</p>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{user.about}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Account Button (only for own profile) */}
            {isOwnProfile && (
              <div className="pt-4 mt-6 border-t border-slate-700/50">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full px-4 py-3 text-sm font-medium text-red-400 transition-colors rounded-lg border border-red-400/30 hover:bg-red-400/10"
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
                        className="flex-1 px-4 py-2 text-sm font-medium transition-colors rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700/50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

