// pages/ProfilPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./profil.css";
import ProfilHeader from "../profil/profilHeader";
import ProfilTabs from "../profil/profilTabs";
import AchievementList from "../profil/achievementList";
import UserData from "../profil/userData";
import EditProfilForm from "../profil/editProfilForm";
import { SquarePen, X } from "lucide-react";

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState("badge");
  const [isEditing, setIsEditing] = useState(false);
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleEditSuccess = () => {
    setIsEditing(false);
    // Refresh user data after successful edit
    if (refreshUser) {
      refreshUser();
    }
  };

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
          className={`editButton ${isEditing ? 'cancelMode' : ''}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <X size={16} style={{ marginRight: "6px" }} />
              Batal
            </>
          ) : (
            <>
              <SquarePen size={16} style={{ marginRight: "6px" }} />
              Edit Profil
            </>
          )}
        </button>
      </div>

      {/* Show Edit Form when editing */}
      {isEditing ? (
        <EditProfilForm 
          user={user} 
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <ProfilHeader />
          <ProfilTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="tabContent">
            <div className="tabContentWrapper">
              {activeTab === "badge" && <AchievementList />}
              {activeTab === "data" && <UserData />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}