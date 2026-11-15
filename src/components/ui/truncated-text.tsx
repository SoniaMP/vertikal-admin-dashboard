"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Text that gives itself a tooltip, but only once it is actually cut off.
 *
 * Table cells clip to a fixed width, so a long name ends in an ellipsis with no
 * way to read the rest. Showing a tooltip on every cell instead would put one
 * on each "Sí" and each date, which trains people to ignore all of them, so the
 * element measures itself and only offers the tooltip when there is something
 * hidden to reveal.
 */
export function TruncatedText({ text }: { text: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [isClipped, setIsClipped] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () =>
      setIsClipped(element.scrollWidth > element.clientWidth);
    measure();

    // The column width follows the window, so what fits changes with it.
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  const content = (
    <span ref={ref} className="block truncate">
      {text}
    </span>
  );

  if (!isClipped) return content;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
