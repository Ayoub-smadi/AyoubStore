import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async () => {
      const res = await fetch(api.stats.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.stats.get.responses[200].parse(await res.json());
    },
  });
}

export function useStudents() {
  return useQuery({
    queryKey: [api.students.list.path],
    queryFn: async () => {
      const res = await fetch(api.students.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch students");
      return api.students.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.students.create.input>) => {
      const res = await fetch(api.students.create.path, {
        method: api.students.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create student");
      return api.students.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.students.list.path] }),
  });
}

export function useBuses() {
  return useQuery({
    queryKey: [api.buses.list.path],
    queryFn: async () => {
      const res = await fetch(api.buses.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch buses");
      return api.buses.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateBusLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, lat, lng }: { id: number; lat: number; lng: number }) => {
      const url = buildUrl(api.buses.updateLocation.path, { id });
      const res = await fetch(url, {
        method: api.buses.updateLocation.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update bus location");
      return api.buses.updateLocation.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.buses.list.path] }),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: [api.notifications.list.path],
    queryFn: async () => {
      const res = await fetch(api.notifications.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return api.notifications.list.responses[200].parse(await res.json());
    },
  });
}
