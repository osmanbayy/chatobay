import { XIcon } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const LogoutModal = () => {
  const { logout } = useAuthStore();
  return (
    <dialog id="logout_modal" className="text-white modal modal-bottom sm:modal-middle">
      <div className="shadow modal-box bg-gradient-to-b from-gray-800 to-gray-900 ">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="absolute btn btn-sm btn-circle btn-ghost right-2 top-2">
            <XIcon size={25} />
          </button>
        </form>
        <h3 className="text-lg font-bold text-yellow-500">Warning!</h3>
        <p className="py-4 text-white">Are you sure you want to log out?</p>
        <div className="flex justify-end w-full gap-2">
          <button onClick={() => document.getElementById('logout_modal').close()} className="btn btn-sm btn-ghost">No, cancel.</button>
          <button onClick={logout} className="text-white btn btn-sm btn-error">Yes, I'm sure.</button>
        </div>
      </div>
    </dialog>
  );
};

export default LogoutModal;
