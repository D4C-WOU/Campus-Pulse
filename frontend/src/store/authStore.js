import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,

  token: null,

  setAuth: (user, token) =>
    set({
      user,
      token,
    }),

  logout: () => {
    localStorage.removeItem("access_token");

    set({
      user: null,
      token: null,
    });
  },
}));
