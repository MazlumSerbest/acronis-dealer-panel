import { create } from "zustand";

type State = {
    userTenant?: Tenant;
    currentTenant?: Tenant;
};

type Action = {
    updateMainTenant: (userTenant: Tenant) => void;
    updateCurrentTenant: (currentTenant: Tenant) => void;
};

const useAcronisStore = create<State & Action>((set) => ({
    userTenant: undefined,
    currentTenant: undefined,
    updateMainTenant: (tenant) => set(() => ({ userTenant: tenant })),
    updateCurrentTenant: (tenant) => set(() => ({ currentTenant: tenant })),
}));

export default useAcronisStore;
