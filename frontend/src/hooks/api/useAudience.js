import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { audienceApi } from "../../api/audienceApi";

export const audienceKeys = {
  all: ["audience"],
  list: (filters) => [...audienceKeys.all, "list", filters],
};

// Hook to fetch audience data (with pagination and filters)
export const useAudience = (filters = {}, options = {}) => {
  const currentUser = useSelector((state) => state.auth.user);
  
  return useQuery({
    queryKey: audienceKeys.list(filters),
    queryFn: () => audienceApi.fetchAudience(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!currentUser, // Only fetch if logged in
    ...options,
  });
};

// Hook to export audience as CSV
export const useExportAudienceCSV = () => {
  return useMutation({
    mutationFn: (filters) => audienceApi.exportAudienceCSV(filters),
    onSuccess: (data, variables) => {
      // Create a Blob from the response data
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      
      // Set the file name (use the filter name or default to 'audience.csv')
      const fileName = variables?.filter ? `${variables.filter}.csv` : 'audience.csv';
      link.setAttribute('download', fileName);
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    },
  });
};
