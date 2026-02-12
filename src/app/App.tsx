import { workerHost } from "@/entities/worker/WorkerHost";
import type { FilterPayload } from "@/shared/lib/worker/types";
import { useEffect } from "react";

function App() {
  const payload: FilterPayload = { filterName: "name", height: 10, width: 10 };

  useEffect(() => {
    const test = async () => {
      try {
        const imageData = new Uint8ClampedArray(1024);
        const data = await workerHost.processImage(imageData, payload);
        console.log(data);
      } catch (e) {
        console.log("From App", e);
      }
    };

    test();
  }, []);
  return <h1>WImage</h1>;
}

export default App;
