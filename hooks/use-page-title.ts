import * as React from "react";

export function usePageTitle(title: string, restoreOnUnmount = true) {
  const originalTitleRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    // Store the original title only once
    if (originalTitleRef.current === null) {
      originalTitleRef.current = document.title;
    }

    // Set the new title
    document.title = `${title} - Sprint Dashboard`;

    // Restore original title on unmount if requested
    return () => {
      if (restoreOnUnmount && originalTitleRef.current !== null) {
        document.title = originalTitleRef.current;
      }
    };
  }, [title, restoreOnUnmount]);
}
