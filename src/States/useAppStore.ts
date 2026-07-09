import { create } from 'zustand'

// Pure UI state only. The imported file list is async/backend data and lives in the
// React Query cache (see useLibrary) — not here.
interface AppState {
    searchTerm: string;
    /**
     * Index (into the filtered list) of the single card currently playing, or null.
     * Keyed by position, not path: the same file can appear many times, so a path
     * would match every duplicate at once — the position is what's unique per card.
     */
    playingIndex: number | null;
    setSearchTerm: (term: string) => void;
    setPlayingIndex: (index: number | null) => void;
    reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    searchTerm: '',
    playingIndex: null,
    // Positions shift when the filter changes, so stop playback to avoid a stale
    // index pointing at a different card.
    setSearchTerm: (term) => set({ searchTerm: term, playingIndex: null }),
    setPlayingIndex: (index) => set({ playingIndex: index }),
    reset: () => set({ searchTerm: '', playingIndex: null }),
}));
