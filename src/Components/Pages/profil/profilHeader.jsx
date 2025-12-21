import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserBadges, uploadUserAvatar } from "../../../services/api";
import { Upload, X } from "lucide-react";
import "../profil/profilHeader.css";

export default function ProfilHeader() {
  const { user } = useAuth();
  const [userBadges, setUserBadges] = useState([]);
  const [activeBadge, setActiveBadge] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('File harus berupa gambar (JPEG, PNG, atau GIF)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Ukuran file tidak boleh lebih dari 2MB');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.user_id) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const result = await uploadUserAvatar(user.user_id, selectedFile);

      if (result.success) {
        setUploadSuccess(true);
        setShowUploadModal(false);
        setSelectedFile(null);
        setPreviewUrl(null);

        // Auto-close success message after 3 seconds
        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);

        // Refresh page to show new avatar
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setUploadError(result.message || 'Gagal mengupload avatar');
      }
    } catch (error) {
      setUploadError(error.message || 'Terjadi kesalahan saat mengupload');
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
  };

  const fetchUserBadges = async () => {
    try {
      const result = await getUserBadges(user.user_id);

      if (result.status === 'success') {
        setUserBadges(result.data || []);

        // Set active badge from localStorage or first badge
        const savedBadge = localStorage.getItem("badge_aktif");
        if (savedBadge) {
          setActiveBadge(parseInt(savedBadge, 10));
        } else if (result.data.length > 0) {
          setActiveBadge(result.data[0].badge_id);
        }
      }
    } catch (error) {
      console.warn("Badges API not available yet:", error.message);
    }
  };

  // Fetch user badges from backend
  useEffect(() => {
    if (user?.user_id) {
      fetchUserBadges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const handleSelectBadge = (badgeId) => {
    setActiveBadge(badgeId);
    localStorage.setItem("badge_aktif", badgeId);
  };

  const currentBadge = userBadges.find(b => b.badge_id === activeBadge);

  // Generate avatar URL
  const getAvatarUrl = () => {
    if (user.foto_profil) {
      return `http://127.0.0.1:8000/storage/${user.foto_profil}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama)}&size=120&background=4CAF50&color=fff&bold=true`;
  };

  return (
    <div className="profilHeader">
      {/* Success Message */}
      {uploadSuccess && (
        <div className="uploadSuccessMessage">
          ✓ Avatar berhasil diupload! Halaman akan dimuat ulang...
        </div>
      )}

      <div className="profilInfo">
        <div className="avatarWrapper">
          <img
            src={getAvatarUrl()}
            alt={`${user.nama} profile`}
            className="profilAvatar"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama || 'User')}&size=120&background=4CAF50&color=fff&bold=true`;
            }}
          />
          <button
            className="uploadAvatarBtn"
            onClick={() => setShowUploadModal(true)}
            title="Upload avatar baru"
          >
            <Upload size={16} />
          </button>
        </div>
        <div>
          <h2 className="profilName">{user.nama}</h2>
          <p className="profilEmail">{user.email}</p>
          <span className="profilBadge">
            {user.level || "Member"} • {user.total_poin || 0} Poin
          </span>
          {currentBadge && (
            <span className="profilBadge">
              🏆 {currentBadge.nama_badge || "Badge Aktif"}
            </span>
          )}
        </div>
      </div>

      {userBadges.length > 0 && (
        <div className="badgeSelector">
          <h4>Pilih Badge Aktif:</h4>
          <div className="badgeList">
            {userBadges.map((b, index) => (
              <button
                key={b.badge_id || `badge-${index}`}
                className={`badgeOption ${activeBadge === b.badge_id ? "selected" : ""}`}
                onClick={() => handleSelectBadge(b.badge_id)}
                title={`Reward: +${b.reward_poin || 0} poin`}
              >
                <span className="badgeIconMini">🏆</span>
                <div className="badgeOptionInfo">
                  <span className="badgeOptionName">{b.nama_badge || `Badge ${b.badge_id}`}</span>
                  <span className="badgeOptionReward">+{b.reward_poin || 0} poin</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {userBadges.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '1rem' }}>
          Belum memiliki badge. Setor sampah untuk mendapatkan badge!
        </p>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="uploadModalOverlay">
          <div className="uploadModal">
            <div className="uploadModalHeader">
              <h3>Upload Avatar Baru</h3>
              <button
                className="closeBtn"
                onClick={handleCloseModal}
                disabled={uploading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="uploadModalContent">
              {/* Preview */}
              {previewUrl && (
                <div className="previewContainer">
                  <img src={previewUrl} alt="Preview" className="previewImage" />
                </div>
              )}

              {/* File Input */}
              <div className="fileInputWrapper">
                <input
                  type="file"
                  id="avatarInput"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatarInput" className="fileInputLabel">
                  <Upload size={20} style={{ marginRight: '8px' }} />
                  {selectedFile ? `${selectedFile.name}` : 'Pilih File atau Drag & Drop'}
                </label>
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="errorMessage">
                  ⚠ {uploadError}
                </div>
              )}

              {/* Info Text */}
              <p className="uploadInfo">
                Format: JPEG, PNG, atau GIF<br />
                Ukuran maksimal: 2MB
              </p>
            </div>

            <div className="uploadModalFooter">
              <button
                className="cancelBtn"
                onClick={handleCloseModal}
                disabled={uploading}
              >
                Batal
              </button>
              <button
                className="uploadBtn"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Mengupload...' : 'Upload Avatar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
