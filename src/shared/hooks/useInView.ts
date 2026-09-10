import { useEffect, useRef } from "react";

export function useInView<T extends HTMLElement = HTMLDivElement>(
  callback: () => void,
) {
  const ref = useRef<T>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          callbackRef.current();
        }
      },
      { threshold: 0, rootMargin: "200px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
}
