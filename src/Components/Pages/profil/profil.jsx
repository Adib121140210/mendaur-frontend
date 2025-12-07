// pages/ProfilPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./profil.css";
import ProfilHeader from "../profil/profilHeader";
import ProfilTabs from "../profil/profilTabs";
import AchievementList from "../profil/achievementList";
import UserData from "../profil/userData";
import { SquarePen } from "lucide-react";

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState("achievement");
  const [isEditing, setIsEditing] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className="profilPage">
      <div className="editButtonWrapper">
        <button 
          className="editButton"
          onClick={() => setIsEditing(!isEditing)}
        >
          <SquarePen size={16} style={{ marginRight: "6px" }} />
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <ProfilHeader />
      <ProfilTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="tabContent">
        <div className="tabContentWrapper">
          {activeTab === "achievement" && <AchievementList />}
          {activeTab === "data" && <UserData />}
        </div>
      </div>
    </div>
  );
}