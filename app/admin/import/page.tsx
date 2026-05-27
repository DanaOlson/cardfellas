import type { Metadata } from "next";
import { ImportClient } from "./ImportClient";

export const metadata: Metadata = { title: "Import Products" };

export default function ImportPage() {
  return <ImportClient />;
}
