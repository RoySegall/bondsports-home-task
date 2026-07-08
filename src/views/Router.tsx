import {useAppStore} from "../States/useAppStore.ts";
import {LibraryView} from "./LibraryView";
import {EmptyState} from "./EmptyState";

export default function Router() {
    const view = useAppStore((state) => state.view);

    if (view === 'grid') {
        return <LibraryView />;
    }

    return <EmptyState />
}
