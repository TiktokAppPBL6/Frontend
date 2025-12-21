import api from '@/config/api';

export interface FollowRelation {
  followeeId: number;
}

export const followsApi = {
  getFollowing: async (): Promise<FollowRelation[]> => {
    const response = await api.get<FollowRelation[]>('/api/v1/follows/following');
    return response.data;
  },
  
  getFollowers: async (): Promise<FollowRelation[]> => {
    const response = await api.get<FollowRelation[]>('/api/v1/follows/followers');
    return response.data;
  },
};
