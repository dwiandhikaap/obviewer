import $ from "jquery";

export function fixJQueryPassiveHandler() {
    $.event.special.touchstart = {
        setup: function (_, ns, handle: any) {
            this.addEventListener("touchstart", handle, { passive: !ns.includes("noPreventDefault") });
        },
    };
    $.event.special.touchmove = {
        setup: function (_, ns, handle: any) {
            this.addEventListener("touchmove", handle, { passive: !ns.includes("noPreventDefault") });
        },
    };
    $.event.special.wheel = {
        setup: function (_, ns, handle: any) {
            this.addEventListener("wheel", handle, { passive: true });
        },
    };
    $.event.special.mousewheel = {
        setup: function (_, ns, handle: any) {
            this.addEventListener("mousewheel", handle, { passive: true });
        },
    };
}
