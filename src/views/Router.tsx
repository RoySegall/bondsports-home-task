import {LibraryView} from "./LibraryView";
import {EmptyState} from "./EmptyState";
import {useHasLibrary} from "../lib/useLibrary";

export default function Router() {
    const uploadedCsvFile = useHasLibrary();

    if (uploadedCsvFile) {
        return <LibraryView />;
    }

    return <EmptyState />
}
