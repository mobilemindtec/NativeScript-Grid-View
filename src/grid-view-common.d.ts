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
import { EventData } from "@nativescript/core";
import { CoercibleProperty, ContainerView, KeyedTemplate, Length, PercentLength, Property, Template, View } from "@nativescript/core";
import { ItemsSource } from "@nativescript/core/ui/list-view";
import { GridItemEventData, GridView as GridViewDefinition, Orientation } from ".";
export * from "@nativescript/core/ui";
export declare module knownTemplates {
    const itemTemplate = "itemTemplate";
}
export declare module knownMultiTemplates {
    const itemTemplates = "itemTemplates";
}
export declare abstract class GridViewBase extends ContainerView implements GridViewDefinition {
    static itemLoadingEvent: string;
    static itemTapEvent: string;
    static loadMoreItemsEvent: string;
    static scrollEvent: string;
    static knownFunctions: string[];
    _defaultTemplate: KeyedTemplate;
    _itemTemplatesInternal: KeyedTemplate[];
    orientation: Orientation;
    itemTemplate: string | Template;
    itemTemplates: string | KeyedTemplate[];
    items: any[] | ItemsSource;
    isItemsSourceIn: boolean;
    rowHeight: PercentLength;
    colWidth: PercentLength;
    verticalSpacing: Length;
    horizontalSpacing: Length;
    _innerWidth: number;
    _innerHeight: number;
    _effectiveRowHeight: number;
    _effectiveColWidth: number;
    private _itemTemplateSelectorBindable;
    private _itemTemplateSelector;
    get itemTemplateSelector(): string | ((item: any, index: number, items: any) => string);
    set itemTemplateSelector(value: string | ((item: any, index: number, items: any) => string));
    itemIdGenerator: (item: any, index: number, items: any) => number;
    abstract refresh(): any;
    abstract scrollToIndex(index: number, animated: boolean): any;
    onLayout(left: number, top: number, right: number, bottom: number): void;
    _getItemTemplate(index: number): KeyedTemplate;
    _prepareItem(item: View, index: number): void;
    _getDataItem(index: number): any;
    protected _updateColWidthProperty(): void;
    protected _updateRowHeightProperty(): void;
}
export interface GridViewBase {
    on(eventNames: string, callback: (data: EventData) => void, thisArg?: any): any;
    on(event: "itemLoading", callback: (args: GridItemEventData) => void, thisArg?: any): any;
    on(event: "itemTap", callback: (args: GridItemEventData) => void, thisArg?: any): any;
    on(event: "loadMoreItems", callback: (args: EventData) => void, thisArg?: any): any;
}
export declare const itemsProperty: Property<GridViewBase, any[] | ItemsSource>;
export declare const itemTemplateProperty: Property<GridViewBase, string | Template>;
export declare const itemTemplatesProperty: Property<GridViewBase, string | KeyedTemplate[]>;
export declare const rowHeightProperty: CoercibleProperty<GridViewBase, PercentLength>;
export declare const colWidthProperty: CoercibleProperty<GridViewBase, PercentLength>;
export declare const orientationProperty: Property<GridViewBase, Orientation>;
