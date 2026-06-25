import { useQuery } from "@tanstack/react-query";
import { searchApi } from "../../api/searchApi";

export const useSearch = (query, options = {}) => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchApi.fetchResults(query),
    enabled: !!query && query.trim() !== "",
    staleTime: 2 * 60 * 1000, // cache results as fresh for 2 minutes
    ...options,
  });
};
