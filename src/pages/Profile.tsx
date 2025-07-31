import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import ProfilePicture from '../components/Profile/ProfilePicture';
import { User, Mail, Calendar, Shield, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileFormData {
  displayName: string;
}

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: currentUser?.displayName || ''
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!currentUser) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    // Don't update if nothing changed
    if (data.displayName === currentUser.displayName) {
      toast.success('No changes to save');
      return;
    }

    setIsUpdating(true);

    try {
      const { updateProfile } = useAuth();
      await updateProfile({
        displayName: data.displayName
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and profile picture</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
              
              <div className="flex flex-col items-center space-y-4">
                <ProfilePicture size="xl" showUploadButton={true} />
                
                <div className="text-center">
                  <h3 className="font-medium text-gray-900">
                    {currentUser.displayName || 'User'}
                  </h3>
                  <p className="text-sm text-gray-500">{currentUser.email}</p>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  <p>Click the camera icon to upload a new photo</p>
                  <p>Supported formats: JPG, PNG, GIF (max 5MB)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    {...register('displayName', {
                      required: 'Display name is required',
                      minLength: {
                        value: 2,
                        message: 'Display name must be at least 2 characters'
                      },
                      maxLength: {
                        value: 50,
                        message: 'Display name must be less than 50 characters'
                      }
                    })}
                    type="text"
                    placeholder="Enter your display name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {errors.displayName && (
                    <p className="text-sm text-red-600 mt-1">{errors.displayName.message}</p>
                  )}
                </div>

                {/* Account Information (Read-only) */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900">Account Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{currentUser.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Role</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {currentUser.role || 'developer'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Member Since</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(currentUser.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Last Login</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(currentUser.lastLoginAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || isUpdating}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSubmitting || isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 