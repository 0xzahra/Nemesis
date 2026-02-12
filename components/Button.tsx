import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-6 py-3 font-mono text-sm tracking-widest transition-all duration-300 uppercase border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black";
  
  const variants = {
    primary: "border-gray-500 text-gray-300 hover:border-white hover:text-white hover:bg-white/5 focus:ring-white",
    secondary: "border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300 focus:ring-gray-500",
    danger: "border-red-900 text-red-500 hover:bg-red-900/20 hover:border-red-500 hover:text-red-400 focus:ring-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
