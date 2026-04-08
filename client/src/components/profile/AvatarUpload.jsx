import React, { useState, useRef } from 'react';
import { Camera, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { uploadAvatar } from '../../store/slices/profileSlice';
import { updateUser } from '../../store/slices/authSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

const AvatarUpload = ({ user }) => {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    const result = await dispatch(uploadAvatar(file));
    setUploading(false);

    if (uploadAvatar.fulfilled.match(result)) {
      dispatch(updateUser({ avatar: result.payload.avatar }));
      toast.success('Avatar updated!');
    } else {
      setPreview(null);
      toast.error(result.payload || 'Upload failed');
    }
  };

  const avatarSrc = preview || user?.avatar;
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Avatar */}
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: avatarSrc ? 'transparent' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', border: '3px solid white',
        boxShadow: 'var(--shadow-md)',
      }}>
        {avatarSrc ? (
          <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: 'white', fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            {initials}
          </span>
        )}
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%',
          }}>
            <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
          </div>
        )}
      </div>

      {/* Camera button */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        style={{
          position: 'absolute', bottom: 0, right: 0,
          width: 30, height: 30, borderRadius: '50%',
          background: 'var(--brand-600)', border: '2px solid white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all var(--transition)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--brand-700)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--brand-600)'}
      >
        <Camera size={14} color="white" />
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default AvatarUpload;
