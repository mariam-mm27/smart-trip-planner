import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";
import { FiUser, FiMail, FiLock, FiCheckCircle, FiAlertCircle, FiLogOut, FiCamera, FiTrash2 } from "react-icons/fi";
import styles from "../../styles/Profile.module.css";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [tripsCount, setTripsCount] = useState(0);
  const [placesCount, setPlacesCount] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    } else if (user) {
      getProfile();
    }
  }, [user, authLoading, navigate]);

  const getProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") console.error("Profile query error:", error);
      if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
      }

      const { count: tripsC } = await supabase
        .from("trips")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (typeof tripsC === "number") setTripsCount(tripsC);

      const { count: placesC } = await supabase
        .from("favorites")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (typeof placesC === "number") setPlacesCount(placesC);

    } catch (error) {
      console.error("Error fetching profile details:", error.message);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    setMessage({ type: "", text: "" });

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
      });

      if (error) throw error;

      await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      setMessage({ type: "success", text: "Name updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSavingName(false);
    }
  };

  const handleDirectPasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setMessage({ type: "success", text: "Password updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSavingPassword(false);
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      setMessage({ type: "", text: "" });

      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      setAvatarUrl(publicUrl);

      await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: publicUrl,
      });

      setMessage({ type: "success", text: "Avatar updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: `Upload failed: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setUploading(true);
      setMessage({ type: "", text: "" });

      await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: null,
      });

      setAvatarUrl("");
      setMessage({ type: "success", text: "Photo removed successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  if (authLoading) return <div className={styles.loadingScreen}>Loading...</div>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.avatarBlock}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarFallback}>
                {fullName ? fullName.charAt(0).toUpperCase() : <FiUser />}
              </div>
            )}
          </div>

          <div className={styles.photoActionsRow}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={styles.changePhotoBtn}
              disabled={uploading}
            >
              <FiCamera /> {uploading ? "..." : "Change"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
            />
            {avatarUrl && (
              <button type="button" onClick={handleDeletePhoto} className={styles.deletePhotoBtn} disabled={uploading}>
                <FiTrash2 /> Delete
              </button>
            )}
          </div>

          <h2 className={styles.userName}>{fullName || "Explorer"}</h2>
          <p className={styles.userEmail}>{user?.email}</p>

          <div className={styles.statsContainer}>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{tripsCount}</span>
              <span className={styles.statLabel}>Trips</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statBox}>
              <span className={styles.statNum}>{placesCount}</span>
              <span className={styles.statLabel}>Places</span>
            </div>
          </div>

          <button onClick={handleSignOut} className={styles.signOutBtn}>
            <FiLogOut /> Sign Out
          </button>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <h1 className={styles.title}>Account Settings</h1>

          {message.text && (
            <div className={`${styles.alert} ${styles[message.type]}`}>
              {message.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Email Display Only  */}
          <div className={styles.readOnlyField}>
            <label><FiMail /> Account Email</label>
            <div className={styles.emailValue}>{user?.email}</div>
          </div>

          <div className={styles.actionDivider} />

          {/* Full Name Section */}
          <form onSubmit={handleUpdateName} className={styles.sectionForm}>
            <div className={styles.field}>
              <label><FiUser /> Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <button type="submit" className={styles.primaryBtn} disabled={savingName}>
              {savingName ? "Saving..." : "Save Name"}
            </button>
          </form>

          <div className={styles.actionDivider} />

          {/* Password Direct Change Section */}
          <form onSubmit={handleDirectPasswordChange} className={styles.sectionForm}>
            <h3 className={styles.subTitle}><FiLock /> Security & Password</h3>
            
            <div className={styles.field}>
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className={styles.primaryBtn} disabled={savingPassword}>
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </main>

      </div>
    </div>
  );
}