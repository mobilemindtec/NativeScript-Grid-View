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
import { ObservableArray } from "@nativescript/core";
import { parse, parseMultipleTemplates } from "@nativescript/core/ui/builder";
import { makeParser, makeValidator } from "@nativescript/core";
import { CSSType, CoercibleProperty, ContainerView, PercentLength, Property } from "@nativescript/core";
import { addWeakEventListener, removeWeakEventListener } from "@nativescript/core";
import { Label } from "@nativescript/core/ui/label";
const autoEffectiveRowHeight = 100;
const autoEffectiveColWidth = 100;
export * from "@nativescript/core/ui";
export var knownTemplates;
(function (knownTemplates) {
    knownTemplates.itemTemplate = "itemTemplate";
})(knownTemplates || (knownTemplates = {}));
export var knownMultiTemplates;
(function (knownMultiTemplates) {
    knownMultiTemplates.itemTemplates = "itemTemplates";
})(knownMultiTemplates || (knownMultiTemplates = {}));
let GridViewBase = class GridViewBase extends ContainerView {
    constructor() {
        super(...arguments);
        this._defaultTemplate = {
            key: "default",
            createView: () => {
                if (this.itemTemplate) {
                    return parse(this.itemTemplate, this);
                }
                return undefined;
            }
        };
        this._itemTemplatesInternal = new Array(this._defaultTemplate);
        this._innerWidth = 0;
        this._innerHeight = 0;
        this._itemTemplateSelectorBindable = new Label();
        this.itemIdGenerator = (_item, index) => index;
    }
    get itemTemplateSelector() {
        return this._itemTemplateSelector;
    }
    set itemTemplateSelector(value) {
        if (typeof value === "string") {
            this._itemTemplateSelectorBindable.bind({
                sourceProperty: null,
                targetProperty: "templateKey",
                expression: value
            });
            this._itemTemplateSelector = (item, index, items) => {
                item["$index"] = index;
                this._itemTemplateSelectorBindable.bindingContext = item;
                return this._itemTemplateSelectorBindable.get("templateKey");
            };
        }
        else if (typeof value === "function") {
            this._itemTemplateSelector = value;
        }
    }
    onLayout(left, top, right, bottom) {
        super.onLayout(left, top, right, bottom);
        this._innerWidth = right - left - this.effectivePaddingLeft - this.effectivePaddingRight;
        this._effectiveColWidth = PercentLength.toDevicePixels(this.colWidth, autoEffectiveColWidth, this._innerWidth);
        this._innerHeight = bottom - top - this.effectivePaddingTop - this.effectivePaddingBottom;
        this._effectiveRowHeight = PercentLength.toDevicePixels(this.rowHeight, autoEffectiveRowHeight, this._innerHeight);
    }
    _getItemTemplate(index) {
        let templateKey = "default";
        if (this.itemTemplateSelector) {
            const dataItem = this._getDataItem(index);
            templateKey = this._itemTemplateSelector(dataItem, index, this.items);
        }
        for (const template of this._itemTemplatesInternal) {
            if (template.key === templateKey) {
                return template;
            }
        }
        return this._itemTemplatesInternal[0];
    }
    _prepareItem(item, index) {
        if (item) {
            item.bindingContext = this._getDataItem(index);
        }
    }
    _getDataItem(index) {
        return this.isItemsSourceIn ? this.items.getItem(index) : this.items[index];
    }
    _updateColWidthProperty() {
        colWidthProperty.coerce(this);
    }
    _updateRowHeightProperty() {
        rowHeightProperty.coerce(this);
    }
};
GridViewBase.itemLoadingEvent = "itemLoading";
GridViewBase.itemTapEvent = "itemTap";
GridViewBase.loadMoreItemsEvent = "loadMoreItems";
GridViewBase.scrollEvent = "scroll";
GridViewBase.knownFunctions = ["itemTemplateSelector", "itemIdGenerator"];
GridViewBase = __decorate([
    CSSType("GridView")
], GridViewBase);
export { GridViewBase };
export const itemsProperty = new Property({
    name: "items",
    valueChanged: (target, oldValue, newValue) => {
        const getItem = newValue && newValue.getItem;
        target.isItemsSourceIn = typeof getItem === "function";
        if (oldValue instanceof ObservableArray) {
            removeWeakEventListener(oldValue, ObservableArray.changeEvent, target.refresh, target);
        }
        if (newValue instanceof ObservableArray) {
            addWeakEventListener(newValue, ObservableArray.changeEvent, target.refresh, target);
        }
        target.refresh();
    }
});
itemsProperty.register(GridViewBase);
export const itemTemplateProperty = new Property({
    name: "itemTemplate",
    valueChanged: (target) => {
        target.refresh();
    }
});
itemTemplateProperty.register(GridViewBase);
export const itemTemplatesProperty = new Property({
    name: "itemTemplates",
    valueConverter: (value) => {
        if (typeof value === "string") {
            return parseMultipleTemplates(value);
        }
        return value;
    }
});
itemTemplatesProperty.register(GridViewBase);
const defaultRowHeight = "auto";
export const rowHeightProperty = new CoercibleProperty({
    name: "rowHeight",
    defaultValue: defaultRowHeight,
    affectsLayout: true,
    equalityComparer: PercentLength.equals,
    valueConverter: PercentLength.parse,
    coerceValue: (target, value) => {
        return target.nativeView ? value : defaultRowHeight;
    },
    valueChanged: (target, oldValue, newValue) => {
        target._effectiveRowHeight = PercentLength.toDevicePixels(newValue, autoEffectiveRowHeight, target._innerHeight);
        target.refresh();
    }
});
rowHeightProperty.register(GridViewBase);
const defaultColWidth = "auto";
export const colWidthProperty = new CoercibleProperty({
    name: "colWidth",
    defaultValue: PercentLength.parse("100"),
    affectsLayout: true,
    equalityComparer: PercentLength.equals,
    valueConverter: PercentLength.parse,
    coerceValue: (target, value) => {
        return target.nativeView ? value : defaultColWidth;
    },
    valueChanged: (target, oldValue, newValue) => {
        target._effectiveColWidth = PercentLength.toDevicePixels(newValue, autoEffectiveColWidth, target._innerWidth);
        target.refresh();
    }
});
colWidthProperty.register(GridViewBase);
const converter = makeParser(makeValidator("horizontal", "vertical"));
export const orientationProperty = new Property({
    name: "orientation",
    defaultValue: "vertical",
    affectsLayout: true,
    valueChanged: (target, oldValue, newValue) => {
        target.refresh();
    },
    valueConverter: converter
});
orientationProperty.register(GridViewBase);
//# sourceMappingURL=grid-view-common.js.map