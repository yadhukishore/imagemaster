import { Camera } from "lucide-react";

function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <Camera className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-400 animate-pulse" />
      <h1 className="font-extrabold text-xl sm:text-2xl lg:text-3xl bg-gradient-to-r from-white via-indigo-200 to-indigo-400 text-transparent bg-clip-text">
        Image<span className="text-indigo-400">Master</span>
      </h1>
    </div>
  );
}

export default AppLogo;