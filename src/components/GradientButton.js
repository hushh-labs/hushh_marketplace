import React from 'react';
import { motion } from 'framer-motion';

const GradientButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false, 
  size = 'default',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    small: 'py-2 px-4 text-sm',
    default: 'py-3 px-6 text-body',
    large: 'py-4 px-8 text-lg'
  };

  return (
    <motion.button
      className={`
        bg-gradient-primary text-white font-semibold rounded-button 
        transition-all duration-300 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
      whileHover={!disabled ? { opacity: 0.9 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default GradientButton;
