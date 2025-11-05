import axiosClient, { shouldUseMock } from './axiosClient';
import type { Report, ReportCreateRequest, ReportUpdateRequest, ID } from '@/types';
import { mockDelay } from '@/mocks/mockDB';

export const reportsApi = {
  // Create report
  createReport: async (data: ReportCreateRequest): Promise<Report> => {
    try {
      const response = await axiosClient.post<Report>('/reports/', data);
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        const newReport: Report = {
          id: Date.now(),
          reporterId: 1,
          targetType: data.targetType,
          targetId: data.targetId,
          reason: data.reason,
          description: data.description,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        return newReport;
      }
      throw error;
    }
  },

  // Get all reports (admin)
  getReports: async (): Promise<{ reports: Report[]; total: number }> => {
    try {
      const response = await axiosClient.get<{ reports: Report[]; total: number }>('/reports/');
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        return { reports: [], total: 0 };
      }
      throw error;
    }
  },

  // Get my reports
  getMyReports: async (): Promise<{ reports: Report[]; total: number }> => {
    try {
      const response = await axiosClient.get<{ reports: Report[]; total: number }>('/reports/my');
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        return { reports: [], total: 0 };
      }
      throw error;
    }
  },

  // Get report by ID
  getReport: async (reportId: ID): Promise<Report> => {
    try {
      const response = await axiosClient.get<Report>(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        throw new Error('Report not found');
      }
      throw error;
    }
  },

  // Update report (admin)
  updateReport: async (reportId: ID, data: ReportUpdateRequest): Promise<Report> => {
    try {
      const response = await axiosClient.put<Report>(`/reports/${reportId}`, data);
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        throw new Error('Report not found');
      }
      throw error;
    }
  },
};
