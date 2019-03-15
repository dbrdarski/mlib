const { isPrimitive, copy, empty, each } = require('../Utils');
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

// !sideEffect === lift -> returns state (snapshot)

const StateGetter = (state, {parent, property, mutable} = {}) => {
	let dirty = false;
	return ({
		get: ({ sideEffect, mutate, freeze }) => {
			state = (!sideEffect || mutate && dirty && !sideEffect) ? state : copy(state);
			console.log([!sideEffect, mutate, dirty, mutable])
			console.log((!sideEffect || dirty) ? "NOT" : "YES")
			sideEffect && sideEffect(state);
			if ( !mutate ) {
				if ( sideEffect && !dirty && parent != null ) parent[property] = state;
			}
			console.log({sideEffect, mutate, dirty})
			dirty = mutate;
			freeze && Object.freeze(state);
			return state;
		},
		isDirty: () => dirty
	});
}

const apply = (fn) => fn();
const applyToObjectKeys = (v, k, object) => {
	isPrimitive(v) || v();
};

const CreateProxy = (record, { parent, property, handler, mutable } = {}) => {
	let proxy,
			childrenProxies = {},
			state = StateGetter(record, { parent, property, mutable });

	return proxy = new Proxy(new Function, {
		apply: ( target, thisArg, args ) => {
			// TODO: write the mutable resoling all temporary mutations case!!!!!!!!!!!!!!!!!!!!!!
		  const [ fn ] = args;
			// console.log({fn, str: fn.toSource()})
			if( !args.length ){
				record = state.get({
					sideEffect: mutable
						? (record) => each(proxy, applyToObjectKeys)
						: false,
					mutate: false,
					freeze: true
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
		},
		get: (target, prop, parent) => {
			let p = record[prop];
			return isPrimitive(p)
				? p
				: isCallable(p)
					? p.bind(record)
					: spawnChildProxy(childrenProxies, prop, p, parent, mutable);
		},
		set: (target, prop, value) => {
			const condition = state[prop] !== value;
			if( condition ){
				record = state.get({
					sideEffect: (record) => record[prop] = value,
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
				record = state.get({
					sideEffect: (record) => delete record[prop],
					mutate: mutable
				});
				delete childrenProxies[prop];
				// should childrenProxies allways be deleted (for deleteProperty)?
				mutable || handler && handler(record);
			}

		}
		// apply: (...args) => {
		// 	console.log({ record, args })
		// 	record(...args)
		// },
	});
}

module.exports = {
	CreateState,
	CreateProxy
}
