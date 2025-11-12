import React, { useState } from "react";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { useAuthStore } from "../store/useAuthStore";
import { ImageIcon, PhoneIcon, SparklesIcon, UserIcon } from "lucide-react";
import { LoaderIcon } from "react-hot-toast";

const OnboardingPage = () => {
  const { completeOnboarding, isCompletingOnboarding, authUser } = useAuthStore();
  const [about, setAbout] = useState(authUser?.about || "");
  const [phone, setPhone] = useState(authUser?.phone || "");
  const [profilePreview, setProfilePreview] = useState(authUser?.profilePic || "");
  const [profileData, setProfileData] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setProfilePreview(reader.result);
      setProfileData(reader.result);
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {};
    if (profileData) payload.profilePic = profileData;
    if (typeof about === "string") payload.about = about.trim();
    if (typeof phone === "string") payload.phone = phone.trim();

    try {
      await completeOnboarding(payload);
    } catch {
      // errors handled by store toasts
    }
  };

  return (
    <div className="flex items-center justify-center w-full p-4">
      <div className="relative w-full max-w-5xl md:h-[720px] h-[650px]">
        <BorderAnimatedContainer>
          <div className="grid items-center justify-center h-full gap-8 px-8 py-10 md:grid-cols-2">
            <div className="flex flex-col justify-center h-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-cyan-500/10 text-cyan-300 w-max">
                <SparklesIcon className="w-4 h-4" />
                Finish setting up
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-slate-100">
                Welcome aboard, {authUser?.fullName?.split(" ")[0] || "there"}!
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Add a personal touch to your profile so friends and teammates can recognize you instantly. Everything here is optional—you can always update it later.
              </p>

              <div className="hidden mt-10 md:flex">
                <img
                  src="/signup.png"
                  alt="Onboarding illustration"
                  className="object-contain w-full max-h-72 opacity-90"
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col justify-center h-full space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center w-32 h-32 overflow-hidden border border-dashed rounded-full border-slate-600 bg-slate-900/60">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile preview" className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-500">
                      <ImageIcon className="w-6 h-6 mb-2" />
                      <span className="text-xs">Add photo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />
                </div>
                <span className="mt-3 text-xs text-slate-500">Max 5MB. PNG, JPG, or GIF.</span>
              </div>

              <div>
                <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-slate-400">
                  About
                </label>
                <div className="relative">
                  <UserIcon className="absolute w-4 h-4 text-slate-500 left-3 top-3" />
                  <textarea
                    value={about}
                    onChange={(event) => setAbout(event.target.value)}
                    rows={4}
                    placeholder="Tell others a little about yourself..."
                    className="w-full py-3 pl-10 pr-4 text-sm transition border rounded-lg bg-slate-900/70 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-slate-400">
                  Phone number
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute w-4 h-4 text-slate-500 left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+90 555 555 5555"
                    className="w-full py-3 pl-10 pr-4 text-sm transition border rounded-lg bg-slate-900/70 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCompletingOnboarding}
                className="w-full py-3 text-sm font-medium transition-colors rounded-lg bg-cyan-500 text-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400"
              >
                {isCompletingOnboarding ? <LoaderIcon className="w-5 h-5 mx-auto animate-spin" /> : "Save and continue"}
              </button>
            </form>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
};

export default OnboardingPage;

