import { create } from "zustand";

type State = {
    user?: User;
};

type Action = {
    updateUser: (user: User) => void;
};

const useUserStore = create<State & Action>((set) => ({
    updateUser: (user) => set(() => ({ user: user })),
}));

export default useUserStore;
