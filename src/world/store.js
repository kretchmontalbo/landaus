import { create } from 'zustand'

const initialState = {
  tier: null,
  audioEnabled: false,
  pocket: 'home',
  cameraTarget: null
}

export const useWorldStore = create((set, get) => ({
  ...initialState,
  setTier: (tier) => set({ tier }),
  toggleAudio: () => set({ audioEnabled: !get().audioEnabled }),
  setPocket: (pocket) => set({ pocket }),
  setCameraTarget: (cameraTarget) => set({ cameraTarget })
}))
