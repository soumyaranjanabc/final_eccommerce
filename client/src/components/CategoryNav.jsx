import React, { useState } from "react";

const CATEGORY_TREE = [
  {
    name: "Cement & Concrete",
    children: ["OPC Cement", "PPC Cement", "Ready Mix Concrete"],
  },
  {
    name: "Bricks & Blocks",
    children: ["Red Bricks", "Fly Ash Bricks", "AAC Blocks"],
  },
  {
    name: "Steel & Reinforcement",
    children: ["TMT Bars", "Binding Wire", "Steel Angles"],
  },
  {
    name: "Aggregates",
    children: ["Sand (Fine / Coarse)", "Gravel"],
  },
  {
    name: "Plumbing",
    children: ["PVC Pipes", "CPVC Pipes", "Valves & Fittings"],
  },
  {
    name: "Electrical",
    children: ["Wires & Cables", "Switches", "Conduits"],
  },
  {
    name: "Finishing Materials",
    children: ["Tiles", "Paints", "Putty"],
  },
  {
    name: "Tools & Equipment",
    children: ["Drilling Machines", "Safety Helmets", "Gloves"],
  },
];

const CategoryNav = ({ onCategorySelect }) => {
  const [openCategory, setOpenCategory] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  const toggleCategory = (name) => {
    setOpenCategory(openCategory === name ? null : name);
  };

  const selectItem = (item) => {
    setActiveItem(item);
    onCategorySelect(item); // works with search/filter
  };

  return (
    <div className="category-sidebar">
      <h3 className="sidebar-title">Construction Materials</h3>

      {CATEGORY_TREE.map((cat) => (
        <div key={cat.name} className="category-block">
          <div
            className="category-header"
            onClick={() => toggleCategory(cat.name)}
          >
            {cat.name}
            <span>{openCategory === cat.name ? "−" : "+"}</span>
          </div>

          {openCategory === cat.name && (
            <ul className="subcategory-list">
              {cat.children.map((item) => (
                <li
                  key={item}
                  className={activeItem === item ? "active" : ""}
                  onClick={() => selectItem(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryNav;