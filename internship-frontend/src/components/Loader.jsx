// src/components/Loader.jsx
import React from "react";

const Loader = () => (
  <div className="flex justify-center items-center w-full h-64">
    <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-violet-500"></div>
  </div>
);

export default Loader;
