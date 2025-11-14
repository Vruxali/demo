import React from "react";

const Card = ({ title, children, className }) => {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-md ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-3">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
