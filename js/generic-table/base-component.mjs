export class BaseComponent {
    currentElement = null;
    parentElem = null;

    constructor() {
        this.refresh = this.refresh.bind(this);
    }

    renderElement(tagName, attributes, children) {
        const element = document.createElement(tagName.toUpperCase());
        if (typeof attributes === 'object') {
            for (let attributeName in attributes) {
                element[attributeName] = attributes[attributeName];
            }
        }
        if (Array.isArray(children)) {
            for (const child of children) {
                if (typeof child === 'object') {
                    element.appendChild(child);
                } else if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (typeof child === 'number') {
                    element.appendChild(document.createTextNode(String(child)));
                }
                
            }
        }
        return element;
    }

    // initial we can mount component with this callback
    mount(parentElement) {
        const elem = this.render();
        if (this.currentElement) {
            this.currentElement.replaceWith(elem);
        } else {
            parentElement.appendChild(elem);
        }
        this.currentElement = elem;
        this.parentElem = parentElement;
    }

    refresh() {
        this.mount(this.parentElem);
    }
}
