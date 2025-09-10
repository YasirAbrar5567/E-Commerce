import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Loader, AlertCircle } from 'lucide-react';
import { getProfile } from '../api/user';

interface UserProfile {
    id: number;
    username: string;
    email: string;
    created_at: string;
}

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                setProfile(data);
            } catch (err) {
                setError('Failed to load profile. Please make sure you are logged in.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader className="h-16 w-16 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center text-red-500 bg-red-100 border border-red-400 p-6 rounded-lg">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return null; // Should be handled by error state
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-8">
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-full bg-blue-100 mx-auto flex items-center justify-center">
                                <User className="h-12 w-12 text-blue-600" />
                            </div>
                            <h2 className="mt-4 text-3xl font-bold text-gray-900">{profile.username}</h2>
                            <p className="text-gray-500">User Profile</p>
                        </div>

                        <div className="mt-8 border-t border-gray-200 pt-8">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <Mail className="h-5 w-5 mr-2 text-gray-400" />
                                        Email address
                                    </dt>
                                    <dd className="mt-1 text-lg text-gray-900">{profile.email}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                                        Member since
                                    </dt>
                                    <dd className="mt-1 text-lg text-gray-900">
                                        {new Date(profile.created_at).toLocaleDateString()}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
