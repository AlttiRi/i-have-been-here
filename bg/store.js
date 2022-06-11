import {LSObservableProperty, ObservableProperty, ObservableStoreLocalProperty} from "./ObservableProperties.js";

const manifest = chrome.runtime.getManifest();
const defaultIcon  = manifest.browser_action.default_icon;
const defaultTitle = manifest.browser_action.default_title;
const defaultPopup = manifest.browser_action.default_popup;

console.log("Store");


class Store {

    /** @type {ObservableProperty} */
    static popup = new ObservableProperty(defaultIcon);
    /** @type {ObservableProperty} */
    static title = new ObservableProperty(defaultTitle);
    /** @type {ObservableProperty} */
    static icon = new ObservableProperty(defaultPopup);

    // just a test
    /** @type {LSObservableProperty} */
    static text = new LSObservableProperty("text", "text");


    /**
     * @typedef {ObservableProperty} property
     * @param {ObservableProperty} property
     * @param {function(property)} callback
     * @param {boolean} immediately
     */
    static on(property, callback, immediately = false) {
        if (immediately) {
            callback(property.value);
        }
        property.onChanged(callback);
    }
}


const ProxiedStore = new Proxy(Store, {
    set(target, property, value, receiver) {
        if (target[property] instanceof ObservableProperty) {
            target[property].value = value;
            return true;
        } else {
            return Reflect.set(target, property, value, receiver);
        }
    },
    // DO NOT USE if you want to use `Store.on(ObservableProperty)` or `ObservableProperty.onChanged()`
    // get(target, property, receiver) {
    //     if (target[property] instanceof ObservablePropertyClass) {
    //         return target[property].value;
    //     } else {
    //         return Reflect.get(target, property, receiver);
    //     }
    // }
});
export {ProxiedStore as Store};



globalThis.Store = ProxiedStore;

ProxiedStore.on(Store.text, property => {
    console.log("on", property);
}, true);

ProxiedStore.text.onChanged(property => {
    console.log("onChanged", property);
})

// ProxiedStore.text = "123";
// ProxiedStore.text = "3434";
