// import React, { useState } from "react";

// const CATEGORY_TREE = [
//   {
//     name: "Cement & Concrete",
//     children: ["OPC Cement", "PPC Cement", "Ready Mix Concrete"],
//   },
//   {
//     name: "Bricks & Blocks",
//     children: ["Red Bricks", "Fly Ash Bricks", "AAC Blocks"],
//   },
//   {
//     name: "Steel & Reinforcement",
//     children: ["TMT Bars", "Binding Wire", "Steel Angles"],
//   },
//   {
//     name: "Aggregates",
//     children: ["Sand (Fine / Coarse)", "Gravel"],
//   },
//   {
//     name: "Plumbing",
//     children: ["PVC Pipes", "CPVC Pipes", "Valves & Fittings"],
//   },
//   {
//     name: "Electrical",
//     children: ["Wires & Cables", "Switches", "Conduits"],
//   },
//   {
//     name: "Finishing Materials",
//     children: ["Tiles", "Paints", "Putty"],
//   },
//   {
//     name: "Tools & Equipment",
//     children: ["Drilling Machines", "Safety Helmets", "Gloves"],
//   },
// ];

// const CategoryNav = ({ onCategorySelect }) => {
//   const [openCategory, setOpenCategory] = useState(null);
//   const [activeItem, setActiveItem] = useState(null);

//   const toggleCategory = (name) => {
//     setOpenCategory(openCategory === name ? null : name);
//   };

//   const selectItem = (item) => {
//     setActiveItem(item);
//     onCategorySelect(item); // works with search/filter
//   };

//   return (
//     <div className="category-sidebar">
//       <h3 className="sidebar-title">Construction Materials</h3>

//       {CATEGORY_TREE.map((cat) => (
//         <div key={cat.name} className="category-block">
//           <div
//             className="category-header"
//             onClick={() => toggleCategory(cat.name)}
//           >
//             {cat.name}
//             <span>{openCategory === cat.name ? "−" : "+"}</span>
//           </div>

//           {openCategory === cat.name && (
//             <ul className="subcategory-list">
//               {cat.children.map((item) => (
//                 <li
//                   key={item}
//                   className={activeItem === item ? "active" : ""}
//                   onClick={() => selectItem(item)}
//                 >
//                   {item}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CategoryNav;

// client/src/components/CategoryNav.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const CategoryNav = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);
  const [activeId, setActiveId] = useState(null);

  // 1. Fetch real categories from your DB
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Filter to get only Top-Level categories (those with no parent_id)
  const parentCategories = categories.filter(cat => !cat.parent_id);

  const handleParentClick = (id, name) => {
    setOpenCategory(openCategory === id ? null : id);
    setActiveId(id);
    onCategorySelect(id); // Send Number ID 5 to HomePage
  };

  const handleSubClick = (e, id) => {
    e.stopPropagation(); // Prevent closing the parent menu
    setActiveId(id);
    onCategorySelect(id); // Send Number ID 19 to HomePage
  };

  return (
    <div className="category-sidebar">
      <h3 className="sidebar-title">Construction Materials</h3>

      {parentCategories.map((parent) => (
        <div key={parent.id} className="category-block">
          <div
            className={`category-header ${activeId === parent.id ? "active" : ""}`}
            onClick={() => handleParentClick(parent.id, parent.name)}
          >
            {parent.name}
            <span>{openCategory === parent.id ? "−" : "+"}</span>
          </div>

          {openCategory === parent.id && (
            <ul className="subcategory-list">
              {/* Find children belonging to this parent */}
              {categories
                .filter((child) => Number(child.parent_id) === Number(parent.id))
                .map((child) => (
                  <li
                    key={child.id}
                    className={activeId === child.id ? "active" : ""}
                    onClick={(e) => handleSubClick(e, child.id)}
                  >
                    {child.name}
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