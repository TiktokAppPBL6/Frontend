import axiosClient from './axiosClient';

export interface FollowRelation {
  followeeId: number;
}

export const followsApi = {
  getFollowing: async (): Promise<FollowRelation[]> => {
    const response = await axiosClient.get<FollowRelation[]>('/api/v1/follows/following');
    return response.data;
  },
  
  getFollowers: async (): Promise<FollowRelation[]> => {
    const response = await axiosClient.get<FollowRelation[]>('/api/v1/follows/followers');
    return response.data;
  },
};
