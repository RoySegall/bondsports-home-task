import { create } from 'zustand'
import { basename } from '../../shared/deriveMetadata'

// Pure filter derivation (by file name, case-insensitive). Exported for tests.
export function filterPaths(paths: string[], term: string): string[] {
    const query = term.trim().toLowerCase();
    if (!query) {
        return paths;
    }
    return paths.filter((path) => basename(path).toLowerCase().includes(query));
}

interface AppState {
    view: 'import' | 'grid';
    filePaths: string[];
    searchTerm: string;
    /** Computed: filePaths filtered by searchTerm. Kept in sync by the setters. */
    filteredPaths: string[];
    /**
     * Index (into filteredPaths) of the single card currently playing, or null.
     * Keyed by position, not path: the same file can appear many times, so a path
     * would match every duplicate at once — the position is what's unique per card.
     */
    playingIndex: number | null;
    setFilePaths: (paths: string[]) => void;
    setSearchTerm: (term: string) => void;
    setPlayingIndex: (index: number | null) => void;
    reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    view: 'import',
    filePaths: [],
    searchTerm: '',
    filteredPaths: [],
    playingIndex: null,
    setFilePaths: (paths) => set((state) => ({
        filePaths: paths,
        filteredPaths: filterPaths(paths, state.searchTerm),
        playingIndex: null,
        view: 'grid',
    })),
    setSearchTerm: (term) => set((state) => ({
        searchTerm: term,
        filteredPaths: filterPaths(state.filePaths, term),
        // Positions shift when the filter changes, so stop playback to avoid a
        // stale index pointing at a different card.
        playingIndex: null,
    })),
    setPlayingIndex: (index) => set({ playingIndex: index }),
    reset: () => set({ view: 'import', filePaths: [], searchTerm: '', filteredPaths: [], playingIndex: null }),
}));
