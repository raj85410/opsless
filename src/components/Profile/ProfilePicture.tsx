import React, { useState, useRef } from 'react';
import { User, Camera, X, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface ProfilePictureProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showUploadButton?: boolean;
  className?: string;
}

const ProfilePicture: React.FC<ProfilePictureProps> = React.memo(({ 
  size = 'md', 
  showUploadButton = false,
  className = ''
}) => {
  const { currentUser, updateProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 2MB for faster uploads)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB for faster upload');
      return;
    }

    setIsUploading(true);

    try {
      // Optimize image before upload
      const optimizedFile = await optimizeImage(file);
      
      // Upload to Firebase Storage with timestamp for cache busting
      const timestamp = Date.now();
      const fileName = `profile_${timestamp}.jpg`;
      const storageRef = ref(storage, `profile-pictures/${currentUser.uid}/${fileName}`);
      
      await uploadBytes(storageRef, optimizedFile);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile using AuthContext
      await updateProfile({ photoURL: downloadURL });

      toast.success('Profile picture updated successfully!');
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Optimize image for faster upload
  const optimizeImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 300x300 for profile pics)
        const maxSize = 300;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8); // 80% quality
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleRemovePhoto = async () => {
    if (!currentUser) return;

    setIsUploading(true);

    try {
      // Update user profile using AuthContext
      await updateProfile({ photoURL: undefined });

      toast.success('Profile picture removed successfully!');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderAvatar = () => {
    if (currentUser?.photoURL) {
      return (
        <img
          src={currentUser.photoURL}
          alt={currentUser.displayName || 'Profile'}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 ${className}`}
        />
      );
    }

    return (
      <div className={`${sizeClasses[size]} rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-200 ${className}`}>
        {currentUser?.displayName ? (
          <span className={`font-semibold text-blue-600 ${
            size === 'sm' ? 'text-xs' : 
            size === 'md' ? 'text-sm' : 
            size === 'lg' ? 'text-lg' : 'text-xl'
          }`}>
            {getInitials(currentUser.displayName)}
          </span>
        ) : (
          <User className={`text-blue-600 ${
            size === 'sm' ? 'w-4 h-4' : 
            size === 'md' ? 'w-5 h-5' : 
            size === 'lg' ? 'w-8 h-8' : 'w-10 h-10'
          }`} />
        )}
      </div>
    );
  };

  return (
    <div className="relative inline-block">
      {renderAvatar()}
      
      {isUploading && (
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-black bg-opacity-50 flex items-center justify-center`}>
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        </div>
      )}

      {showUploadButton && (
        <div className="absolute -bottom-1 -right-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Camera className="w-3 h-3" />
          </button>
        </div>
      )}

      {currentUser?.photoURL && showUploadButton && (
        <button
          onClick={handleRemovePhoto}
          disabled={isUploading}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
});

export default ProfilePicture; 