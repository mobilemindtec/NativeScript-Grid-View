import { Trace } from "@nativescript/core/trace";

const gridViewTraceCategory = "ns-grid-view";

export function gridViewLog(message: string): void {
    Trace.write(message, gridViewTraceCategory);
}

export function gridViewError(message: string): void {
    Trace.write(message, gridViewTraceCategory, Trace.messageType.error);
}