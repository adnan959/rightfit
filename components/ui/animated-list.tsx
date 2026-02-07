"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedListProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}

export function AnimatedList({
  className,
  children,
  delay = 1000,
}: AnimatedListProps) {
  const [index, setIndex] = useState(0);
  const childrenArray = useMemo(
    () => React.Children.toArray(children),
    [children]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % childrenArray.length);
    }, delay);
    return () => clearInterval(interval);
  }, [childrenArray.length, delay]);

  const itemsToShow = useMemo(() => {
    const result = [];
    for (let i = 0; i <= index; i++) {
      result.push(childrenArray[i]);
    }
    return result.reverse();
  }, [index, childrenArray]);

  return (
    <div className={cn("flex flex-col gap-3 overflow-hidden", className)}>
      {itemsToShow.map((item, i) => (
        <div
          key={(item as React.ReactElement).key ?? i}
          className={cn(
            "transition-all duration-500 ease-out",
            i === 0
              ? "animate-in fade-in slide-in-from-bottom-4"
              : "opacity-100"
          )}
          style={{
            animationDuration: "400ms",
            animationFillMode: "both",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
