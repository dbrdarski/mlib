const { isPrimitive, copyObject, emptyObject } = require('../Utils');
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
	const observer = CreateProxy(state, { handler, mutable });

	return {
		state: observer,
		subscribe,
		unsubscribe
	};
}



const isCallable = (f) => typeof f === 'function';

const StateGetter = (state, {parent, property} = {}) => {
	let dirty = false;
	return ({
		get: ({ op, mutable }) => {
			state = dirty ? state : copyObject(state);
			op && op(state);
			if ( !mutable ) {
				if ( !dirty && parent != null ) parent[property] = state;
			}
			dirty = mutable;
			return state;
		},
		isDirty: () => dirty
	});
}

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
const apply = (fn) => fn();

const CreateProxy = (record, { parent, property, handler, mutable } = {}) => {
	let proxy,
			childrenProxies = {},
			state = StateGetter(record, { parent, property });

	return proxy = new Proxy(new Function, {
		get: (target, prop, parent) => {
			let p = record[prop];
			return isPrimitive(p)
				? p
				: isCallable(p)
					? p.bind(record)
					: spawnChildProxy(childrenProxies, prop, p, parent, mutable);
		},
		deleteProperty: (target, prop) => {
			const condition = record.hasOwnProperty(prop);
			if( condition ){
				record = state.get({
					op: (record) => delete record[prop],
					mutable
				});
				delete childrenProxies[prop];
				// should childrenProxies allways be deleted (for deleteProperty)?
				mutable || handler && handler(record);
			}
		},
		set: (target, prop, value) => {
			const condition = state[prop] !== value;
			if( condition ){
				record = state.get({
					op: (record) => record[prop] = value,
					mutable
				});
				delete childrenProxies[prop];
				// should childrenProxies allways be deleted (for deleteProperty)?
				mutable || handler && handler(record);
			}
			return true;
		},
		// apply: (...args) => {
		// 	console.log({ record, args })
		// 	record(...args)
		// },
		apply: ( target, thisArg, args ) => {
			// TODO: write the mutable resoling all temporary mutations case!!!!!!!!!!!!!!!!!!!!!!
		  const [ fn ] = args;
			// console.log({fn, str: fn.toSource()})
			if( !args.length ){
				record = state.get({
					op: (record) => {
						mutable && childrenProxies.map(apply);
						return Object.freeze(record);
					},
					mutable: false
				});
				handler && handler(record);
				return record;
			}
			// if ( !args.length ){
			// 	if ( !mutable ){
			// 		return record;
			// 	} else {
			//
			// 	}
			// } else if (typeof fn === 'function'){
			// 	// let proxy = CreateProxy(record, { handler: (state) => record = state });
			// 	mutable = false;
			// 	fn(proxy);
			// 	mutable = true;
			// 	record = proxy();
			// 	// console.log({record})
			// 	handler && handler(record);
			// 	return record;
			// }
		}
	});
}

module.exports = {
	CreateState,
	CreateProxy
}
