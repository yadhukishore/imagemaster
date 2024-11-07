import React from 'react';


function LoginSignUpBackground({ children }: any) {
  return (
    <div className="flex">
      <div className="bg-indigo-300 w-[30rem] h-screen flex items-center justify-center">
        {children}
      </div>
      <div
        className="h-screen grow bg-cover bg-center"
        style={{ backgroundImage: `url(https://asset.gecdesigns.com/img/wallpapers/starry-night-sky-reflection-background-hd-wallpaper-sr10012425-1705222416280-cover.webp)` }}
      ></div>
    </div>
  );
}

export default LoginSignUpBackground;
