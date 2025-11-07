import { LoaderIcon } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />
      <LoaderIcon className="size-10 animate-spin" />
    </div>
  );
};

export default PageLoader;
