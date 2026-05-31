import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware"; // ← add createJSONStorage

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      hasHydrated: false,

      setHasHydrated: (val) => set({ hasHydrated: val }),
      login: (userData) => {
        set({ user: { ...userData, loginTime: Date.now() }, isLoggedIn: true });
      },
      logout: () => {
        set({ user: null, isLoggedIn: false });
      },
      getUser: () => {
        return get().user;
      },
      checkAuthExpiration: () => {
        const state = get();
        if (state.user) {
          const loginTime = state.user?.loginTime || 0;
          if (Date.now() - loginTime > 48 * 60 * 60 * 1000) {
            state.logout();
          }
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage), // ← only change here
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.checkAuthExpiration();
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;