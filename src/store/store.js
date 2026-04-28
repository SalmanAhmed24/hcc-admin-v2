import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      hasHydrated: false,
      setHasHydrated: (val) => set({ hasHydrated: val }),  // ← add this action
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
      storage: {                                   // ← fix: modern Zustand API
        getItem: (key) => sessionStorage.getItem(key),
        setItem: (key, val) => sessionStorage.setItem(key, val),
        removeItem: (key) => sessionStorage.removeItem(key),
      },
      version: 1,
      onRehydrateStorage: () => (state) => {       // ← fix: no Promise, use action
        state?.checkAuthExpiration();
        state?.setHasHydrated(true);               // ← this actually works
      },
    }
  )
);

export default useAuthStore;