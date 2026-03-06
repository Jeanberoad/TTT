import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Configuration } from "@shared/schema";

export function useConfig() {
  return useQuery<Configuration>({
    queryKey: ["/api/config"],
    queryFn: () => apiRequest<Configuration>("/api/config"),
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Configuration>) =>
      apiRequest<Configuration>("/api/config", {
        method: "PUT",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
    },
  });
}
