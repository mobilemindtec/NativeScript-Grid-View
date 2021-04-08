/*! *****************************************************************************
Copyright (c) 2019 Tangra Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
***************************************************************************** */
import { View } from "@nativescript/core";
import { GridViewBase } from "./grid-view-common";
export * from "./grid-view-common";
export declare class GridView extends GridViewBase {
    nativeView: androidx.recyclerview.widget.RecyclerView;
    _realizedItems: Map<globalAndroid.view.View, View>;
    createNativeView(): GridViewRecyclerView;
    initNativeView(): void;
    disposeNativeView(): void;
    get android(): androidx.recyclerview.widget.RecyclerView;
    get _childrenCount(): number;
    eachChildView(callback: (child: View) => boolean): void;
    onLayout(left: number, top: number, right: number, bottom: number): void;
    refresh(): void;
    scrollToIndex(index: number, animated?: boolean): void;
    private _setPadding;
    private _getLayoutManagarOrientation;
}
interface GridViewRecyclerView extends androidx.recyclerview.widget.RecyclerView {
    new (context: any, owner: WeakRef<GridView>): GridViewRecyclerView;
}
declare let GridViewRecyclerView: GridViewRecyclerView;
