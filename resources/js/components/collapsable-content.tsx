import React from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function CollapsibleWrapper({
  title,
  items,
  visibleCount = 3,
  renderItem,
  bgColor = "bg-sidebar",
  borderColor = "border-sidebar-border"
}) {
  const [open, setOpen] = React.useState(false);

  if (!items || items.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="h-full w-full rounded-xl p-0">
      <Card className={`${bgColor} p-5 shadow-lg m-4 border ${borderColor} p-2`}>
        {title && (
          <CardTitle className="text-[1rem] text-sidebar-accent-foreground">
            {title}
          </CardTitle>
        )}
        <CardContent className="grid grid-cols-1 gap-2 p-0">
          {/* First visible items */}
          {items.slice(0, visibleCount).map((item, idx) => (
            <React.Fragment key={idx}>
              {renderItem(item)}
            </React.Fragment>
          ))}

          {/* Collapsible hidden items */}
          <CollapsibleContent className="grid grid-cols-1 gap-2">
            {items.slice(visibleCount).map((item, idx) => (
              <React.Fragment key={idx}>
                {renderItem(item)}
              </React.Fragment>
            ))}
          </CollapsibleContent>
        </CardContent>

        {items.length > visibleCount ? (
          <CollapsibleTrigger asChild>
            <button
                type="button"
                className="p-0 m-0 text-sm font-semibold text-[#222831] bg-transparent border-none cursor-pointer dark:text-[#ffffff]"
            >
                {open ? "View less Schedule" : "View full Schedule"}
            </button>
          </CollapsibleTrigger>
        ) : (
          <div className="h-1" />
        )}
      </Card>
    </Collapsible>
  );
}

export { CollapsibleWrapper };
