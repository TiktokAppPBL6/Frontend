import axiosClient, { shouldUseMock } from './axiosClient';
import type { Report, ReportCreateRequest, ReportUpdateRequest, ID } from '@/types';
export const reportsApi = {
  // Create report
  createReport: async (data: ReportCreateRequest): Promise<Report> => {
    try {
      const response = await axiosClient.post<Report>('/reports/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all reports (admin)
  getReports: async (): Promise<{ reports: Report[]; total: number }> => {
    try {
      const response = await axiosClient.get<{ reports: Report[]; total: number }>('/reports/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get my reports
  getMyReports: async (): Promise<{ reports: Report[]; total: number }> => {
    try {
      const response = await axiosClient.get<{ reports: Report[]; total: number }>('/reports/my');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get report by ID
  getReport: async (reportId: ID): Promise<Report> => {
    try {
      const response = await axiosClient.get<Report>(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update report (admin)
  updateReport: async (reportId: ID, data: ReportUpdateRequest): Promise<Report> => {
    try {
      const response = await axiosClient.put<Report>(`/reports/${reportId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
