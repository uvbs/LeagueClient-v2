abstract class Module<T> extends EventSource {
    public static import(url: string): HTMLLinkElement {
        var node = document.createElement('link');
        node.rel = 'import';
        node.type = 'text/html';
        node.href = 'client/' + url
        document.head.appendChild(node);
        return node;
    }

    public static create(template: JSX.Element) {
        return new AnonymousModule<any>(template);
    }

    private _refs: T = {} as T;
    private _node: Swish;
    private _import: Swish;
    public get node() { return this._node; }
    protected get refs() { return this._refs; }

    public closed = this.create<{}>();

    constructor(link: HTMLLinkElement | React.VirtualNode<any>) {
        super();

        if (link instanceof React.VirtualNode) {
            this._node = new Swish(link.create(this, this.refs));
        } else {
            this._import = swish(link['import'], 'body');
            this._node = swish(this._import, 'module').clone(true);

            let callback = (n: Swish) => {
                let ref: string = n.data('ref');
                if (ref) this.refs[ref] = n;

                let events: string = n.data('event');
                if (events) {
                    for (let str of events.split(' ')) {
                        let pair = str.split(':');
                        n.on(pair[0], e => this[pair[1]](e, n));
                    }
                }
            }
            swish(this.node, '*').do(callback);
            callback(this.node);
        }
    }

    public dispose() {
        for (var id in this._events) {
            this._events[id].off(<any>this._eventhandlers[id]);
        }
    }

    public render(parent: Swish) {
        parent.add(this.node);
    }

    private _eventhandlers: { [id: string]: Function } = {};
    private _events: { [id: string]: Subscribable<any> } = {};
    protected subscribe<T>(event: Subscribable<T>, callback: (e: T) => void) {
        let func = (...args) => callback.apply(this, args);
        this._eventhandlers[event.id] = func;
        this._events[event.id] = event;
        event.on(func);
    }

    protected template(id: string, context) {
        var html = swish(this._import, 'template').array
            .first(o => o.data('template') == id).html.trim();

        for (var key in context) {
            html = html.replace(new RegExp('{{ *' + key + ' *}}', 'g'), context[key]);
        }
        var div = document.createElement('div');
        div.innerHTML = html;
        return swish(div.firstChild);
    }

    protected $(query: string): Swish {
        return swish.call(window, this.node, query);
    }
}

export class AnonymousModule<T> extends Module<T> {
    public get refs() { return super.refs; }
}

export default Module;