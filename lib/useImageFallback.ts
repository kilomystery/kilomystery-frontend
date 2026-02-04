import { useCallback, useState } from "react";

export function useImageFallback(primarySrc: string, fallbackSrc: string) {
  const [src, setSrc] = useState(primarySrc);

  const handleError = useCallback(() => {
    setSrc((current) => (current === fallbackSrc ? current : fallbackSrc));
  }, [fallbackSrc]);

  return { src, handleError };
}
