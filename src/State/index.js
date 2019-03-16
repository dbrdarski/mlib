// TODO: Freeze on Create State...
// TODO: Investigate = Deep freeze, deep assign.

const { isPrimitive, copy, empty, each } = require('../Utils');

const ERR_STATE_UPDATE = 'State update argument must either be an Object/Array or an update function.';

const stateDefaults = {
	mutable: false,
};

const CreateState = window.CreateState = (state = {}, options) => {
	const { mutable } = { ...stateDefaults, ...options };
	let listeners = [];
	const subscribe = (fn) => { listeners = listeners.concat(fn) };
	const unsubscribe = (fn) => { listeners = listeners.filter(l => l != fn) };
	const handler = ( state ) => {
		listeners.map(
			(fn) => fn({state})
		);
	};
	const observer = CreateProxy(state, { handler });

	return {
		state: observer,
		subscribe,
		unsubscribe
	};
}

const isCallable = (f) => typeof f === 'function';

const spawnChildProxy = (childrenProxies, prop, p, parent, mutable) => {
	if (childrenProxies[prop] == null) {
		childrenProxies[prop] = CreateProxy(p, {
			parent,
			property: prop,
			mutable
		});
	}
	return childrenProxies[prop];
}

const StateFactory = (state, {parent, property, mutable} = {}) => {
	let dirty = false;
	return ({ stateUpdate, mutate, freeze }) => {
		state = (!stateUpdate || (mutate ? dirty : mutable && mutable !== dirty)) ? state : copy(state);
		if (isCallable(stateUpdate)) {
			stateUpdate(state);
		} else if (stateUpdate) {
			state = stateUpdate;
		}
		if ( !mutate ) {
			if ( stateUpdate && !dirty && parent != null ) parent[property] = state;
		}
		dirty = mutate;
		freeze && Object.freeze(state);
		return state;
	};
}

const apply = (fn) => fn();
const applyToObjectKeys = (v, k, object) => {
	isPrimitive(v) || v();
};

const CreateProxy = (record, { parent, property, handler, mutable } = {}) => {
	let proxy,
			childrenProxies = {},
			state = StateFactory(record, { parent, property, mutable });

	return proxy = new Proxy(new Function, {
		apply: ( target, thisArg, args ) => {
		  const [ stateUpdate, options ] = args;
			if( !args.length ){
				record = state({
					stateUpdate: mutable
						? (record) => each(proxy, applyToObjectKeys)
						: false,
					mutate: false,
					freeze: true
				});
				handler && handler(record);
				return record;
			} else {
				const proxy = CreateProxy(record, { mutable: true });
				if (isPrimitive(stateUpdate)) {
					throw new Error(ERR_STATE_UPDATE)
				} else if (isCallable(stateUpdate)) {
					stateUpdate(proxy);
				} else {
					Object.assign(proxy, stateUpdate);
				}
				record = state({
					stateUpdate: proxy(),
					mutate: false,
					freeze: true
				});
				return record;
			}
		},
		get: (target, prop, parent) => {
			let p = record[prop];
			return isPrimitive(p)
				? p
				: isCallable(p)
					? p.bind(record) // maybe it should be binded to Proxy instead
					: spawnChildProxy(childrenProxies, prop, p, parent, mutable);
		},
		set: (target, prop, value) => {
			const condition = state[prop] !== value;
			if( condition ){
				record = state({
					stateUpdate: (record) => record[prop] = value,
					mutate: mutable
				});
				delete childrenProxies[prop];
				// should childrenProxies allways be deleted (for deleteProperty)?
				mutable || handler && handler(record);
			}
			return true;
		},
		deleteProperty: (target, prop) => {
			const condition = record.hasOwnProperty(prop);
			if( condition ){
				record = state({
					stateUpdate: (record) => delete record[prop],
					mutate: mutable
				});
				delete childrenProxies[prop];
				// should childrenProxies allways be deleted (for deleteProperty)?
				mutable || handler && handler(record);
			}
		}
	});
}

module.exports = {
	CreateState,
	CreateProxy
}
