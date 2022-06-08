const STRATEGY_SINGLETON = 'singleton';
const STRATEGY_PROTOTYPE = 'prototype';

class Container {
    constructor(config) {
        this.config = config;
        this.configured = {};
        this.registered = {};
    }

    get(id) {
        if(this.configured[id]) {
            return this.configured[id]
        }
        else if(!this.registered[id]) {
            throw new Error(`Service ${id} is not registered`);
        }
        const {callback, strategy} = this.registered[id];

        const result = this.isClass(callback)
            ? new callback(this)
            : callback(this);

        if(strategy === STRATEGY_SINGLETON) {
            this.configured[id] = result;
        }
        return result;
    }

    register(id, callback, strategy = STRATEGY_SINGLETON) {
        if(this.registered[id]) {
            throw new Error(`Service ${id} is exist`);
        }
        else if(typeof callback !== 'function') {
            throw new Error('Callback is not a function')
        }
        this.registered[id] = {
            callback,
            strategy
        };
    }

    isClass(v) {
        return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
    }
}

export default Container;