
import React from "react";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8 w-auto" }) => {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="8" fill="#008750" />
      <path
        d="M10 15C10 12.7909 11.7909 11 14 11H26C28.2091 11 30 12.7909 30 15V25C30 27.2091 28.2091 29 26 29H14C11.7909 29 10 27.2091 10 25V15Z"
        fill="#FCD116"
      />
      <path
        d="M20 24C22.2091 24 24 22.2091 24 20C24 17.7909 22.2091 16 20 16C17.7909 16 16 17.7909 16 20C16 22.2091 17.7909 24 20 24Z"
        fill="#E8112D"
      />
      <path
        d="M27.5 13.5C28.0523 13.5 28.5 13.0523 28.5 12.5C28.5 11.9477 28.0523 11.5 27.5 11.5C26.9477 11.5 26.5 11.9477 26.5 12.5C26.5 13.0523 26.9477 13.5 27.5 13.5Z"
        fill="#E8112D"
      />
      <path
        d="M12.5 28.5C13.0523 28.5 13.5 28.0523 13.5 27.5C13.5 26.9477 13.0523 26.5 12.5 26.5C11.9477 26.5 11.5 26.9477 11.5 27.5C11.5 28.0523 11.9477 28.5 12.5 28.5Z"
        fill="#E8112D"
      />
    </svg>
  );
};

export default Logo;
