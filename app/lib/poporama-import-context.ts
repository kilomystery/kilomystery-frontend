import { AsyncLocalStorage } from "async_hooks";
import type { TitleState } from "./poporama-titles";
import type { MetaNode } from "./poporama-shopify";
export type ImportContext = { accessToken: string; articles: MetaNode[]; titles: Map<string, TitleState>; signal: AbortSignal };
const context = new AsyncLocalStorage<ImportContext>();
export const importContext = () => context.getStore();
export const withImportContext = <T>(value: ImportContext, work: () => Promise<T>) => context.run(value, work);
