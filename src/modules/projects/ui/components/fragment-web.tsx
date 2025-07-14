import { Fragment } from "@/generated/prisma/client";
import { useState } from "react";
import { LucideExternalLink, LucideRefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { toast } from "sonner";

type FragmentWebProps = {
  data: Fragment;
};

const FragmentWeb = ({ data }: FragmentWebProps) => {
  const [copied, setCopied] = useState(false);
  const [fragmentKey, setFragmentKey] = useState(0);

  const onRefresh = () => {
    // 将iframe的key值改变，从而实现页面内刷新
    setFragmentKey((prev) => prev + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.sandboxUrl);
    setCopied(true);
    toast.info("Copied to clipboard " + data.sandboxUrl);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Hint text="Refresh">
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <LucideRefreshCcw className="w-4 h-4" />
          </Button>
        </Hint>
        <Hint text="Copy URL">
          <Button
            size="sm"
            variant="outline"
            disabled={!data.sandboxUrl || copied}
            onClick={handleCopy}
            className="flex-1 justify-start text-start font-normal"
          >
            <span className="truncate">{data.sandboxUrl}</span>
          </Button>
        </Hint>
        <Hint text="Open in a new tab" side="bottom" align="start">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (!data.sandboxUrl) return;
              window.open(data.sandboxUrl, "_blank");
            }}
          >
            <LucideExternalLink className="w-4 h-4" />
          </Button>
        </Hint>
      </div>
      <iframe
        key={fragmentKey}
        className="h-full w-full"
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={data.sandboxUrl}
      />
    </div>
  );
};

export { FragmentWeb };
