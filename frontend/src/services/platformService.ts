import { request } from "./api";
import type { Platform, PlatformInput } from "@/types/platform";

export const platformService = {
  list() {
    return request<Platform[]>("/platforms");
  },
  getById(id: number) {
    return request<Platform>(`/platforms/${id}`);
  },
  create(data: PlatformInput) {
    return request<Platform>("/platforms", { method: "POST", body: data });
  },
  update(id: number, data: PlatformInput) {
    return request<Platform>(`/platforms/${id}`, { method: "PUT", body: data });
  },
  remove(id: number) {
    return request<void>(`/platforms/${id}`, { method: "DELETE" });
  },
};
