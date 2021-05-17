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
var GridViewComponent_1;
import { ChangeDetectionStrategy, Component, ElementRef, IterableDiffers, forwardRef, NgZone } from "@angular/core";
import { TEMPLATED_ITEMS_COMPONENT, TemplatedItemsComponent } from "@nativescript/angular";
import { isKnownView, registerElement } from "@nativescript/angular";
import { GridView } from "../grid-view";
let GridViewComponent = GridViewComponent_1 = class GridViewComponent extends TemplatedItemsComponent {
    constructor(_elementRef, _iterableDiffers, zone) {
        super(_elementRef, _iterableDiffers, zone);
    }
    get nativeElement() {
        return this.templatedItemsView;
    }
};
GridViewComponent = GridViewComponent_1 = __decorate([
    Component({
        selector: "GridView",
        template: `
        <DetachedContainer>
            <Placeholder #loader></Placeholder>
        </DetachedContainer>`,
        changeDetection: ChangeDetectionStrategy.OnPush,
        providers: [{ provide: TEMPLATED_ITEMS_COMPONENT, useExisting: forwardRef(() => GridViewComponent_1) }]
    }),
    __metadata("design:paramtypes", [ElementRef,
        IterableDiffers, NgZone])
], GridViewComponent);
export { GridViewComponent };
if (!isKnownView("GridView")) {
    registerElement("GridView", () => GridView);
}
//# sourceMappingURL=grid-view-comp.js.map