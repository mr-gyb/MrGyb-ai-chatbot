import React from "react";
import Image from "next/image";

interface WatermarkBackgroundProps {
  show: boolean;
}

const WatermarkBackground: React.FC<WatermarkBackgroundProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-[400px] h-[400px] shadow-2xl rounded-lg overflow-hidden">
        <Image
          src="/MrGYB.png"
          alt=""
          fill
          className="object-contain"
          priority
          aria-hidden="true"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
        />
      </div>
    </div>
  );
};

export default WatermarkBackground;
