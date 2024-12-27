'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type UserProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
};

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = params; // Directly destructure params
        await fetchProfile(id);

        if (user) {
          await checkFollowStatus(id);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch the profile. Please try again.');
      }
    };
    fetchData();
  }, [params, user]);

  const fetchProfile = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('profile')
        .select('id, username, avatar_url, followers_count, following_count')
        .eq('id', id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Handle missing row
        console.error('Profile not found:', error);
        setError('Profile not found.');
      } else if (error) {
        throw error;
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkFollowStatus = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user?.id)
        .eq('following_id', id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Follow relationship not found
        setIsFollowing(false);
      } else if (error) {
        throw error;
      } else {
        setIsFollowing(!!data);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) return;

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile?.id);

        if (error) throw error;

        setIsFollowing(false);
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: profile?.id });

        if (error) throw error;

        setIsFollowing(true);
      }

      // Refresh profile data
      if (profile?.id) fetchProfile(profile.id);

      toast({
        title: 'Success',
        description: isFollowing
          ? 'Unfollowed successfully'
          : 'Followed successfully',
      });
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast({
        title: 'Error',
        description: 'Failed to follow/unfollow. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[100px]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <Alert>
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>This user profile does not exist.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">User Profile</h1>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
              <AvatarFallback>
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile.username}</h2>
              <p>
                {profile.followers_count} followers ·{' '}
                {profile.following_count} following
              </p>
            </div>
          </div>
          {user && user.id !== profile.id && (
            <Button onClick={handleFollow} className="mt-4">
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
