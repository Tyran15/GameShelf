import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Se o texto tiver mais que isso, mostra botão "Ler mais"
const CHAR_THRESHOLD = 300;

export function ExpandableDescription({
  text,
  previewLines = 6,
}: {
  text: string;
  previewLines?: number;
}) {
  const [open, setOpen] = useState(false);
  const isLong = text.length > CHAR_THRESHOLD;

  return (
    <>
      <p
        className="whitespace-pre-line text-sm leading-relaxed sm:text-base"
        style={
          isLong
            ? {
                display: "-webkit-box",
                WebkitLineClamp: previewLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {text}
      </p>

      {isLong ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="mt-2 h-auto p-0 text-sm font-medium text-primary"
          onClick={() => setOpen(true)}
        >
          <Maximize2 className="mr-1.5 size-3.5" />
          Ler descrição completa
        </Button>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col">
          <DialogHeader>
            <DialogTitle>Descrição completa</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <p className="whitespace-pre-line text-sm leading-relaxed sm:text-base">
              {text}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}