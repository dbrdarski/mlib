// TODO: Freeze on Create State...
// TODO: Investigate: deep freeze, deep assign.

const { isPrimitive, isCallable, copy, map, empty, each } = require('../Utils');

const ERR_STATE_UPDATE = 'State update argument must either be an Object/Array or an update function.';

const stateDefaults = {
	mutable: false,
};

const CreateState = (state = {}, options) => {
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
};

const StateGuard = (state, { mutable = false } = {}) => {
	let dirty = false;
	return () => {
		if( mutable && dirty ){
			return state;
		}
		dirty = mutable;
		return state = copy(state);
	}
};

const mutatorList = { pop: 0, shift: 0, push: 1, unshift: 1, splice: 0, reverse: 0, fill: 0, sort: 0 };

const apply = (fn) => fn();
const applyToObjectKeys = (proxy) => (v, k) => isPrimitive(v) || proxy[k]();


const SubProxy = (subarray, prop, subproxies, { handler, mutable }) => {
	if (!subproxies.hasOwnProperty(prop)) {
		subproxies[prop] = CreateProxy(subarray, {
			handler,
			mutable
		});
	}
	return subproxies[prop];
};
const produce = (...args) => {
	const [ first, second ] = args;
	if (args.length === 1 && isCallable(first)){
		return state => CreateProxy(state)(first)();
	} else {
		return CreateProxy(first)(second)()
	}
}
const CreateProxy = window.CreateProxy = (record, { handler, mutable = false } = {}) => {
	let proxy,
			subproxies = {},
			state = StateGuard(record, { mutable });
	const isArray = Array.isArray(record);
	const defineMutatorFn = isArray && mutable
		? (len, prop) => ({
			value: (...args) => {
				if ( args.length >= len ) record = state();
				return Array.prototype[prop].apply(record, args);
			}
		})
		: null;
	const mutators = isArray && mutable
		? Object.defineProperties({}, map(mutatorList, defineMutatorFn))
		: null;
	return proxy = new Proxy(new Function, {
		get: (target, prop, parent) => {
			if (record.hasOwnProperty(prop)) {
				const p = record[prop];
				return isPrimitive(p)
					? p
					: SubProxy(p, prop, subproxies, {
						mutable,
						handler: (record) => parent[prop] = record
					});
			} else if (isArray && mutable && mutators.hasOwnProperty(prop)) {
				return mutators[prop];
			} else if (record.constructor.prototype.hasOwnProperty(prop)) {
				return record.constructor.prototype[prop].bind(record);
			}
		},
		set: (target, prop, value) => {
			if(!record.hasOwnProperty(prop) || record[prop] !== value){
				record = state();
				record[prop] = value;
				delete subproxies[prop];
				// mutable ||
				handler && handler(record);
			}
		},
		deleteProperty: (target, prop) => {
			if( record.hasOwnProperty(prop) ){
				record = state();
				delete record[prop];
				delete subproxies[prop];
				// mutable ||
				handler && handler(record);
			}
		},
		apply: ( target, thisArg, args ) => {
			if(!args.length){
				Object.freeze(record);
				handler && handler(record);
				if (mutable) {
					state = StateGuard(record);
					map(record, applyToObjectKeys(proxy));
				}
				return record;
			} else if (args.length === 1){
				const [stateUpdate] = args;
				if (isCallable(stateUpdate)){
					const p = CreateProxy(record, { mutable: true });
					stateUpdate(p);
					record = p();
					state = StateGuard(record, { mutable });
					handler && handler(record);
					return proxy;
				}
			}
		}
	});
};

module.exports = {
	CreateState,
	CreateProxy
}
