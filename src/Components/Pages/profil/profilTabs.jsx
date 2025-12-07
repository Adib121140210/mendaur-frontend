// components/ProfilTabs.jsx
import React from "react";
import "../profil/profilTabs.css";

export default function ProfilTabs({ activeTab, setActiveTab }) {
  return (
    <div className="profilTabs">
      <div className="tabWrapper">
        <button
          className={`tabButton ${activeTab === "achievement" ? "active" : ""}`}
          onClick={() => setActiveTab("achievement")}
        >
          Achievement
        </button>
        <button
          className={`tabButton ${activeTab === "data" ? "active" : ""}`}
          onClick={() => setActiveTab("data")}
        >
          Data Poin
        </button>
      </div>
    </div>
  );
}