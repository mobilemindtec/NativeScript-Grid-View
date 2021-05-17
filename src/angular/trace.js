import { Trace } from "@nativescript/core/trace";
const gridViewTraceCategory = "ns-grid-view";
export function gridViewLog(message) {
    Trace.write(message, gridViewTraceCategory);
}
export function gridViewError(message) {
    Trace.write(message, gridViewTraceCategory, Trace.messageType.error);
}
//# sourceMappingURL=trace.js.map