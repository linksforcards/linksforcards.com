import type { Graph } from "schema-dts";
import { serializeLd } from "@/lib/jsonld";

export function JsonLd({ graph }: { graph: Graph }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(graph) }} />;
}
