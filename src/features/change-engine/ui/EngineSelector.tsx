import { useEditorActions, useEngine } from "@/entities/editor";
import type { ComputeEngine } from "@/entities/editor/model/types";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/components/ui/tabs";
import { Cpu, Zap } from "lucide-react";

export const EngineSelector = () => {
  const engine = useEngine();
  const { setEngine } = useEditorActions();

  return (
    <div className="space-y-2.5">
      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Execution Engine
      </h4>
      <Tabs
        defaultValue={engine}
        onValueChange={(val: string) => setEngine?.(val as ComputeEngine)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="js" className="text-xs gap-2">
            <Cpu className="h-3.5 w-3.5" /> JS
          </TabsTrigger>
          <TabsTrigger value="wasm" className="text-xs gap-2">
            <Zap className="h-3.5 w-3.5" /> WASM
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
