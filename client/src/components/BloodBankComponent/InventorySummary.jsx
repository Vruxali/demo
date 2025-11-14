import React from "react";
import InventoryCard from "./InventoryCard";

const InventorySummary = ({ inventory }) => {
  return (
    <section className="mt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Blood Inventory Summary
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {inventory.map((item) => (
          <InventoryCard key={item.type} {...item} />
        ))}
      </div>
    </section>
  );
};

export default InventorySummary;
