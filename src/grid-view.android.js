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
import { GridLayout } from "@nativescript/core/ui/layouts";
import * as utils from "@nativescript/core/utils";
import { GridViewBase, colWidthProperty, itemTemplatesProperty, orientationProperty, paddingBottomProperty, paddingLeftProperty, paddingRightProperty, paddingTopProperty, rowHeightProperty, } from "./grid-view-common";
export * from "./grid-view-common";
const DUMMY = "DUMMY";
export class GridView extends GridViewBase {
    constructor() {
        super(...arguments);
        this._realizedItems = new Map();
    }
    createNativeView() {
        initGridViewRecyclerView();
        const recyclerView = new GridViewRecyclerView(this._context, new WeakRef(this));
        initGridViewAdapter();
        const adapter = new GridViewAdapter(new WeakRef(this));
        adapter.setHasStableIds(true);
        recyclerView.setAdapter(adapter);
        recyclerView.adapter = adapter;
        const orientation = this._getLayoutManagarOrientation();
        const layoutManager = new androidx.recyclerview.widget.GridLayoutManager(this._context, 1);
        recyclerView.setLayoutManager(layoutManager);
        layoutManager.setOrientation(orientation);
        recyclerView.layoutManager = layoutManager;
        initGridViewScrollListener();
        const scrollListener = new GridViewScrollListener(new WeakRef(this));
        recyclerView.addOnScrollListener(scrollListener);
        recyclerView.scrollListener = scrollListener;
        return recyclerView;
    }
    initNativeView() {
        super.initNativeView();
        const nativeView = this.nativeView;
        nativeView.adapter.owner = new WeakRef(this);
        nativeView.scrollListener.owner = new WeakRef(this);
        nativeView.owner = new WeakRef(this);
        colWidthProperty.coerce(this);
        rowHeightProperty.coerce(this);
    }
    disposeNativeView() {
        this.eachChildView((view) => {
            view.parent._removeView(view);
            return true;
        });
        this._realizedItems.clear();
        const nativeView = this.nativeView;
        this.nativeView.removeOnScrollListener(nativeView.scrollListener);
        nativeView.scrollListener = null;
        nativeView.adapter = null;
        nativeView.layoutManager = null;
        super.disposeNativeView();
    }
    get android() {
        return this.nativeView;
    }
    get _childrenCount() {
        return this._realizedItems.size;
    }
    [paddingTopProperty.getDefault]() {
        return this.nativeView.getPaddingTop();
    }
    [paddingTopProperty.setNative](value) {
        this._setPadding({ top: this.effectivePaddingTop });
    }
    [paddingRightProperty.getDefault]() {
        return this.nativeView.getPaddingRight();
    }
    [paddingRightProperty.setNative](value) {
        this._setPadding({ right: this.effectivePaddingRight });
    }
    [paddingBottomProperty.getDefault]() {
        return this.nativeView.getPaddingBottom();
    }
    [paddingBottomProperty.setNative](value) {
        this._setPadding({ bottom: this.effectivePaddingBottom });
    }
    [paddingLeftProperty.getDefault]() {
        return this.nativeView.getPaddingLeft();
    }
    [paddingLeftProperty.setNative](value) {
        this._setPadding({ left: this.effectivePaddingLeft });
    }
    [orientationProperty.getDefault]() {
        const layoutManager = this.nativeView.getLayoutManager();
        if (layoutManager.getOrientation() === androidx.recyclerview.widget.LinearLayoutManager.HORIZONTAL) {
            return "horizontal";
        }
        return "vertical";
    }
    [orientationProperty.setNative](value) {
        const layoutManager = this.nativeView.getLayoutManager();
        if (value === "horizontal") {
            layoutManager.setOrientation(androidx.recyclerview.widget.LinearLayoutManager.HORIZONTAL);
        }
        else {
            layoutManager.setOrientation(androidx.recyclerview.widget.LinearLayoutManager.VERTICAL);
        }
    }
    [itemTemplatesProperty.getDefault]() {
        return null;
    }
    [itemTemplatesProperty.setNative](value) {
        this._itemTemplatesInternal = new Array(this._defaultTemplate);
        if (value) {
            this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
        }
        this.nativeViewProtected.setAdapter(new GridViewAdapter(new WeakRef(this)));
        this.refresh();
    }
    eachChildView(callback) {
        this._realizedItems.forEach((view, key) => {
            callback(view);
        });
    }
    onLayout(left, top, right, bottom) {
        super.onLayout(left, top, right, bottom);
        this.refresh();
    }
    refresh() {
        if (!this.nativeView || !this.nativeView.getAdapter()) {
            return;
        }
        const layoutManager = this.nativeView.getLayoutManager();
        let spanCount;
        if (this.orientation === "horizontal") {
            spanCount = Math.max(Math.floor(this._innerHeight / this._effectiveRowHeight), 1) || 1;
        }
        else {
            spanCount = Math.max(Math.floor(this._innerWidth / this._effectiveColWidth), 1) || 1;
        }
        layoutManager.setSpanCount(spanCount);
        this.nativeView.getAdapter().notifyDataSetChanged();
    }
    scrollToIndex(index, animated = true) {
        if (animated) {
            this.nativeView.smoothScrollToPosition(index);
        }
        else {
            this.nativeView.scrollToPosition(index);
        }
    }
    _setPadding(newPadding) {
        const nativeView = this.nativeView;
        const padding = {
            top: nativeView.getPaddingTop(),
            right: nativeView.getPaddingRight(),
            bottom: nativeView.getPaddingBottom(),
            left: nativeView.getPaddingLeft()
        };
        const newValue = Object.assign(padding, newPadding);
        nativeView.setPadding(newValue.left, newValue.top, newValue.right, newValue.bottom);
    }
    _getLayoutManagarOrientation() {
        let orientation = androidx.recyclerview.widget.LinearLayoutManager.VERTICAL;
        if (this.orientation === "horizontal") {
            orientation = androidx.recyclerview.widget.LinearLayoutManager.HORIZONTAL;
        }
        return orientation;
    }
}
let GridViewScrollListener;
function initGridViewScrollListener() {
    if (GridViewScrollListener) {
        return;
    }
    var GridViewScrollListenerImpl = /** @class */ (function (_super) {
    __extends(GridViewScrollListenerImpl, _super);
    function GridViewScrollListenerImpl(owner) {
        var _this = _super.call(this) || this;
        _this.owner = owner;
        return global.__native(_this);
    }
    GridViewScrollListenerImpl.prototype.onScrolled = function (view, dx, dy) {
        var owner = this.owner.get();
        if (!owner) {
            return;
        }
        owner.notify({
            eventName: GridViewBase.scrollEvent,
            object: owner,
            scrollX: dx,
            scrollY: dy,
        });
        var lastVisibleItemPos = view.getLayoutManager().findLastCompletelyVisibleItemPosition();
        if (owner && owner.items) {
            var itemCount = owner.items.length - 1;
            if (lastVisibleItemPos === itemCount) {
                owner.notify({
                    eventName: GridViewBase.loadMoreItemsEvent,
                    object: owner
                });
            }
        }
    };
    GridViewScrollListenerImpl.prototype.onScrollStateChanged = function (view, newState) {
        // Not Needed
    };
    return GridViewScrollListenerImpl;
}(androidx.recyclerview.widget.RecyclerView.OnScrollListener));
    GridViewScrollListener = GridViewScrollListenerImpl;
}
let GridViewAdapter;
function initGridViewAdapter() {
    if (GridViewAdapter) {
        return;
    }
    var GridViewCellHolder = /** @class */ (function (_super) {
    __extends(GridViewCellHolder, _super);
    function GridViewCellHolder(owner, gridView) {
        var _this = _super.call(this, owner.get().android) || this;
        _this.owner = owner;
        _this.gridView = gridView;
        var nativeThis = global.__native(_this);
        var nativeView = owner.get().android;
        nativeView.setOnClickListener(nativeThis);
        return nativeThis;
    }
    GridViewCellHolder.prototype.onClick = function (v) {
        var gridView = this.gridView.get();
        gridView.notify({
            eventName: GridViewBase.itemTapEvent,
            object: gridView,
            index: this.getAdapterPosition(),
            view: this.view,
            android: v,
            ios: undefined,
        });
    };
    Object.defineProperty(GridViewCellHolder.prototype, "view", {
        get: function () {
            return this.owner ? this.owner.get() : null;
        },
        enumerable: true,
        configurable: true
    });
    GridViewCellHolder = __decorate([
        Interfaces([android.view.View.OnClickListener])
    ], GridViewCellHolder);
    return GridViewCellHolder;
}(androidx.recyclerview.widget.RecyclerView.ViewHolder));
    var GridViewAdapterImpl = /** @class */ (function (_super) {
    __extends(GridViewAdapterImpl, _super);
    function GridViewAdapterImpl(owner) {
        var _this = _super.call(this) || this;
        _this.owner = owner;
        return global.__native(_this);
    }
    GridViewAdapterImpl.prototype.getItemCount = function () {
        var owner = this.owner.get();
        return owner.items ? owner.items.length : 0;
    };
    GridViewAdapterImpl.prototype.getItem = function (i) {
        var owner = this.owner.get();
        if (owner && owner.items && i < owner.items.length) {
            return owner._getDataItem(i);
        }
        return null;
    };
    GridViewAdapterImpl.prototype.getItemId = function (i) {
        var owner = this.owner.get();
        var item = this.getItem(i);
        var id = i;
        if (this.owner && item && owner.items) {
            id = owner.itemIdGenerator(item, i, owner.items);
        }
        return long(id);
    };
    GridViewAdapterImpl.prototype.getItemViewType = function (index) {
        var owner = this.owner.get();
        var template = owner._getItemTemplate(index);
        var itemViewType = owner._itemTemplatesInternal.indexOf(template);
        return itemViewType;
    };
    GridViewAdapterImpl.prototype.onCreateViewHolder = function (parent, viewType) {
        var owner = this.owner.get();
        var template = owner._itemTemplatesInternal[viewType];
        var view = template.createView();
        if (!view) {
            view = new GridLayout();
            view[DUMMY] = true;
        }
        owner._addView(view);
        owner._realizedItems.set(view.android, view);
        //@ts-nocheck
        return new GridViewCellHolder(new WeakRef(view), new WeakRef(owner));
    };
    GridViewAdapterImpl.prototype.onBindViewHolder = function (vh, index) {
        var owner = this.owner.get();
        var args = {
            eventName: GridViewBase.itemLoadingEvent,
            object: owner,
            index: index,
            // This is needed as the angular view generation with a single template is done in the event handler
            // for this event (????). That;s why if we created above an empty StackLayout, we must send `null`
            // sp that the angular handler initializes the correct view. 
            view: vh.view[DUMMY] ? null : vh.view,
            android: vh,
            ios: undefined,
        };
        owner.notify(args);
        if (vh.view[DUMMY]) {
            vh.view.addChild(args.view);
            vh.view[DUMMY] = undefined;
        }
        if (owner.orientation === "horizontal") {
            vh.view.width = utils.layout.toDeviceIndependentPixels(owner._effectiveColWidth);
        }
        else {
            vh.view.height = utils.layout.toDeviceIndependentPixels(owner._effectiveRowHeight);
        }
        owner._prepareItem(vh.view, index);
    };
    return GridViewAdapterImpl;
}(androidx.recyclerview.widget.RecyclerView.Adapter));
    GridViewAdapter = GridViewAdapterImpl;
}
let GridViewRecyclerView;
function initGridViewRecyclerView() {
    if (GridViewRecyclerView) {
        return;
    }
    class GridViewRecyclerViewImpl extends androidx.recyclerview.widget.RecyclerView {
        constructor(context, owner) {
            super(context);
            this.owner = owner;
            return global.__native(this);
        }
        onLayout(changed, l, t, r, b) {
            if (changed) {
                const owner = this.owner.get();
                owner.onLayout(l, t, r, b);
            }
            super.onLayout(changed, l, t, r, b);
        }
    }
    GridViewRecyclerView = GridViewRecyclerViewImpl;
}
//# sourceMappingURL=grid-view.android.js.map