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
import { Observable } from "@nativescript/core/data/observable";
import { View } from "@nativescript/core";
import * as utils from "@nativescript/core/utils";
import { GridViewBase, itemTemplatesProperty, orientationProperty, paddingBottomProperty, paddingLeftProperty, paddingRightProperty, paddingTopProperty, } from "./grid-view-common";
export * from "./grid-view-common";
export class GridView extends GridViewBase {
    constructor() {
        super();
        this._preparingCell = false;
        this._map = new Map();
    }
    createNativeView() {
        this._layout = UICollectionViewFlowLayout.alloc().init();
        this._layout.minimumLineSpacing = 0;
        this._layout.minimumInteritemSpacing = 0;
        return UICollectionView.alloc().initWithFrameCollectionViewLayout(CGRectMake(0, 0, 0, 0), this._layout);
    }
    initNativeView() {
        super.initNativeView();
        const nativeView = this.nativeViewProtected;
        nativeView.backgroundColor = UIColor.clearColor;
        nativeView.registerClassForCellWithReuseIdentifier(GridViewCell.class(), this._defaultTemplate.key);
        nativeView.autoresizesSubviews = false;
        nativeView.autoresizingMask = 0;
        this._dataSource = GridViewDataSource.initWithOwner(new WeakRef(this));
        nativeView.dataSource = this._dataSource;
        this._delegate = UICollectionViewDelegateImpl.initWithOwner(new WeakRef(this));
        this._setNativeClipToBounds();
        this._updateColWidthProperty();
        this._updateRowHeightProperty();
    }
    disposeNativeView() {
        this._layout = null;
        this._delegate = null;
        this._dataSource = null;
        super.disposeNativeView();
    }
    onLoaded() {
        super.onLoaded();
        this.ios.delegate = this._delegate;
    }
    onUnloaded() {
        this.ios.delegate = null;
        super.onUnloaded();
    }
    get ios() {
        return this.nativeViewProtected;
    }
    get _childrenCount() {
        return this._map.size;
    }
    get horizontalOffset() {
        return this.nativeViewProtected.contentOffset.x;
    }
    get verticalOffset() {
        return this.nativeViewProtected.contentOffset.y;
    }
    [paddingTopProperty.getDefault]() {
        return this._layout.sectionInset.top;
    }
    [paddingTopProperty.setNative](value) {
        this._setPadding({ top: utils.layout.toDeviceIndependentPixels(this.effectivePaddingTop) });
    }
    [paddingRightProperty.getDefault]() {
        return this._layout.sectionInset.right;
    }
    [paddingRightProperty.setNative](value) {
        this._setPadding({ right: utils.layout.toDeviceIndependentPixels(this.effectivePaddingRight) });
    }
    [paddingBottomProperty.getDefault]() {
        return this._layout.sectionInset.bottom;
    }
    [paddingBottomProperty.setNative](value) {
        this._setPadding({ bottom: utils.layout.toDeviceIndependentPixels(this.effectivePaddingBottom) });
    }
    [paddingLeftProperty.getDefault]() {
        return this._layout.sectionInset.left;
    }
    [paddingLeftProperty.setNative](value) {
        this._setPadding({ left: utils.layout.toDeviceIndependentPixels(this.effectivePaddingLeft) });
    }
    [orientationProperty.getDefault]() {
        if (this._layout.scrollDirection === 1) {
            return "horizontal";
        }
        return "vertical";
    }
    [orientationProperty.setNative](value) {
        if (value === "horizontal") {
            this._layout.scrollDirection = 1;
        }
        else {
            this._layout.scrollDirection = 0;
        }
    }
    [itemTemplatesProperty.getDefault]() {
        return null;
    }
    [itemTemplatesProperty.setNative](value) {
        this._itemTemplatesInternal = new Array(this._defaultTemplate);
        if (value) {
            for (const template of value) {
                this.ios.registerClassForCellWithReuseIdentifier(GridViewCell.class(), template.key);
            }
            this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
        }
        this.refresh();
    }
    eachChildView(callback) {
        this._map.forEach((view, key) => {
            callback(view);
        });
    }
    onLayout(left, top, right, bottom) {
        super.onLayout(left, top, right, bottom);
        const layout = this.ios.collectionViewLayout;
        layout.itemSize = CGSizeMake(utils.layout.toDeviceIndependentPixels(this._effectiveColWidth), utils.layout.toDeviceIndependentPixels(this._effectiveRowHeight));
        this._map.forEach((childView, listViewCell) => {
            childView.iosOverflowSafeAreaEnabled = false;
            View.layoutChild(this, childView, 0, 0, this._effectiveColWidth, this._effectiveRowHeight);
        });
    }
    refresh() {
        this.eachChildView((view) => {
            if (!(view.bindingContext instanceof Observable)) {
                view.bindingContext = null;
            }
            return true;
        });
        if (this.isLoaded) {
            this.ios.reloadData();
            this.requestLayout();
        }
    }
    scrollToIndex(index, animated = true) {
        this.ios.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0), this.orientation === "vertical" ? 1 : 8, animated);
    }
    requestLayout() {
        if (!this._preparingCell) {
            super.requestLayout();
        }
    }
    measure(widthMeasureSpec, heightMeasureSpec) {
        const changed = this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
        super.measure(widthMeasureSpec, heightMeasureSpec);
        if (changed) {
            this.ios.reloadData();
        }
    }
    onMeasure(widthMeasureSpec, heightMeasureSpec) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        this._map.forEach((childView, gridViewCell) => {
            View.measureChild(this, childView, childView._currentWidthMeasureSpec, childView._currentHeightMeasureSpec);
        });
    }
    _setNativeClipToBounds() {
        this.ios.clipsToBounds = true;
    }
    _removeContainer(cell) {
        const view = cell.view;
        view.parent._removeView(view);
        this._map.delete(cell);
    }
    _prepareCell(cell, indexPath) {
        try {
            this._preparingCell = true;
            let view = cell.view;
            if (!view) {
                view = this._getItemTemplate(indexPath.row).createView();
            }
            const args = {
                eventName: GridViewBase.itemLoadingEvent,
                object: this,
                index: indexPath.row,
                view,
                ios: cell,
                android: undefined,
            };
            this.notify(args);
            view = args.view;
            if (!cell.view) {
                cell.owner = new WeakRef(view);
            }
            else if (cell.view !== view) {
                this._removeContainer(cell);
                cell.view.nativeView.removeFromSuperview();
                cell.owner = new WeakRef(view);
            }
            this._prepareItem(view, indexPath.row);
            this._map.set(cell, view);
            if (view && !view.parent) {
                this._addView(view);
                cell.contentView.addSubview(view.ios);
            }
            this._layoutCell(view, indexPath);
        }
        finally {
            this._preparingCell = false;
        }
    }
    _layoutCell(cellView, index) {
        if (cellView) {
            const widthMeasureSpec = utils.layout.makeMeasureSpec(this._effectiveColWidth, utils.layout.EXACTLY);
            const heightMeasureSpec = utils.layout.makeMeasureSpec(this._effectiveRowHeight, utils.layout.EXACTLY);
            View.measureChild(this, cellView, widthMeasureSpec, heightMeasureSpec);
        }
    }
    _setPadding(newPadding) {
        const padding = {
            top: this._layout.sectionInset.top,
            right: this._layout.sectionInset.right,
            bottom: this._layout.sectionInset.bottom,
            left: this._layout.sectionInset.left
        };
        const newValue = Object.assign(padding, newPadding);
        this._layout.sectionInset =
            UIEdgeInsetsFromString(`{${newValue.top},${newValue.left},${newValue.bottom},${newValue.right}}`);
    }
}
var GridViewCell = /** @class */ (function (_super) {
    __extends(GridViewCell, _super);
    function GridViewCell() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridViewCell.new = function () {
        return _super.new.call(this);
    };
    GridViewCell.class = function () {
        return GridViewCell;
    };
    Object.defineProperty(GridViewCell.prototype, "view", {
        get: function () {
            return this.owner ? this.owner.get() : null;
        },
        enumerable: true,
        configurable: true
    });
    GridViewCell.prototype.willMoveToSuperview = function (newSuperview) {
        var parent = (this.view ? this.view.parent : null);
        // When inside GidView and there is no newSuperview this cell is 
        // removed from native visual tree so we remove it from our tree too.
        if (parent && !newSuperview) {
            parent._removeContainer(this);
        }
    };
    return GridViewCell;
}(UICollectionViewCell));
var GridViewDataSource = /** @class */ (function (_super) {
    __extends(GridViewDataSource, _super);
    function GridViewDataSource() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ObjCProtocols = [UICollectionViewDataSource];
        return _this;
    }
    GridViewDataSource.initWithOwner = function (owner) {
        var dataSource = GridViewDataSource.new();
        dataSource._owner = owner;
        return dataSource;
    };
    GridViewDataSource.prototype.numberOfSectionsInCollectionView = function (collectionView) {
        return 1;
    };
    GridViewDataSource.prototype.collectionViewNumberOfItemsInSection = function (collectionView, section) {
        var owner = this._owner.get();
        return owner.items ? owner.items.length : 0;
    };
    GridViewDataSource.prototype.collectionViewCellForItemAtIndexPath = function (collectionView, indexPath) {
        var owner = this._owner.get();
        var template = owner._getItemTemplate(indexPath.row);
        var cell = collectionView.dequeueReusableCellWithReuseIdentifierForIndexPath(template.key, indexPath) || GridViewCell.new();
        owner._prepareCell(cell, indexPath);
        var cellView = cell.view;
        if (cellView && cellView.isLayoutRequired) {
            cellView.iosOverflowSafeAreaEnabled = false;
            View.layoutChild(owner, cellView, 0, 0, owner._effectiveColWidth, owner._effectiveRowHeight);
        }
        return cell;
    };
    return GridViewDataSource;
}(NSObject));
var UICollectionViewDelegateImpl = /** @class */ (function (_super) {
    __extends(UICollectionViewDelegateImpl, _super);
    function UICollectionViewDelegateImpl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ObjCProtocols = [UICollectionViewDelegate, UICollectionViewDelegateFlowLayout];
        return _this;
    }
    UICollectionViewDelegateImpl.initWithOwner = function (owner) {
        var delegate = UICollectionViewDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    };
    UICollectionViewDelegateImpl.prototype.collectionViewWillDisplayCellForItemAtIndexPath = function (collectionView, cell, indexPath) {
        var owner = this._owner.get();
        if (indexPath.row === owner.items.length - 1) {
            owner.notify({
                eventName: GridViewBase.loadMoreItemsEvent,
                object: owner
            });
        }
        if (cell.preservesSuperviewLayoutMargins) {
            cell.preservesSuperviewLayoutMargins = false;
        }
        if (cell.layoutMargins) {
            cell.layoutMargins = UIEdgeInsetsZero;
        }
    };
    UICollectionViewDelegateImpl.prototype.collectionViewDidSelectItemAtIndexPath = function (collectionView, indexPath) {
        var cell = collectionView.cellForItemAtIndexPath(indexPath);
        var owner = this._owner.get();
        owner.notify({
            eventName: GridViewBase.itemTapEvent,
            object: owner,
            index: indexPath.row,
            view: cell.view,
            ios: cell,
            android: undefined,
        });
        cell.highlighted = false;
        return indexPath;
    };
    UICollectionViewDelegateImpl.prototype.scrollViewDidScroll = function (collectionView) {
        var owner = this._owner.get();
        owner.notify({
            object: owner,
            eventName: GridViewBase.scrollEvent,
            scrollX: owner.horizontalOffset,
            scrollY: owner.verticalOffset
        });
    };
    return UICollectionViewDelegateImpl;
}(NSObject));
//# sourceMappingURL=grid-view.ios.js.map