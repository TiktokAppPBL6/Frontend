import axiosClient from './axiosClient';
import type { Report, ReportCreateRequest, ReportUpdateRequest, ID } from '@/types';
export const reportsApi = {
  // Create report
  createReport: async (data: ReportCreateRequest): Promise<Report> => {
    try {
      const response = await axiosClient.post<Report>('/api/v1/reports/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all reports (admin)
  // OpenAPI spec: GET /api/v1/reports/ returns array directly, not {reports, total}
  getReports: async (params?: { skip?: number; limit?: number; status?: string }): Promise<Report[]> => {
    try {
      const response = await axiosClient.get<Report[]>('/api/v1/reports/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get my reports
  // OpenAPI spec: GET /api/v1/reports/my returns array directly
  getMyReports: async (params?: { skip?: number; limit?: number }): Promise<Report[]> => {
    try {
      const response = await axiosClient.get<Report[]>('/api/v1/reports/my', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get report by ID
  getReport: async (reportId: ID): Promise<Report> => {
    try {
      const response = await axiosClient.get<Report>(`/api/v1/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update report (admin)
  updateReport: async (reportId: ID, data: ReportUpdateRequest): Promise<Report> => {
    try {
      const response = await axiosClient.put<Report>(`/api/v1/reports/${reportId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
