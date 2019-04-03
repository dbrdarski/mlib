// FIX: Nested objects not immutable/frozen!!!!!

// TODO: Freeze on Create State...
// TODO: Investigate: deep freeze, deep assign.

const { isPrimitive, isCallable, copy, map, empty, each } = require('../Utils');

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
	const observer = CreateProxy(state, { handler, mutable });

	return {
		state: observer,
		subscribe,
		unsubscribe
	};
}


// const mutatorTarget = { current: null };
// const fn = (prop, len) => (...args) => {
// 	!(args.length < len){
// 		mutatorTarget.current()
// 	}
// }



const StateGuard = (state, { mutable = false } = {}) => {
	let dirty = false;
	return () => {
		if( mutable && dirty ){
			console.log('RETURNING STATE', { mutable, dirty })
			return state;
		}
		console.log('COPYING STATE')
		dirty = mutable;
		return state = copy(state);
	}
}

const mutatorList = {
	pop: 0,
	shift: 0,
	push: 1,
	unshift: 1,
	splice: 0,
	reverse: 0,
	fill: 0,
	sort: 0
}

// ArrayMutatorProto = Object.define({}, );

// class ObservableArray extends Array {
// 	constructor(...props){
// 		super(...props);
// 	}
// 	push(...args){
// 		if (args.length){
// 			Array.prototype.push.call(this);
// 		}
// 	}
// }

const apply = (fn) => fn();
const applyToObjectKeys = (proxy) => (v, k) => {
	return isPrimitive(v) || proxy[k]();
};



const SubProxy = (subarray, prop, subproxies, { handler, mutable }) => {
	if (!subproxies.hasOwnProperty(prop)) {
		subproxies[prop] = CreateProxy(subarray, {
			handler,
			mutable
		});
	}
	return subproxies[prop];
}

var CreateProxy = window.CreateProxy = (record, { handler, mutable = false }) => {

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
			console.log("SET", { value, prop, record })
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
				const [stateUpdate] = args;;
				if (isCallable(stateUpdate)){
					let p = CreateProxy(record, { mutable: true });
					stateUpdate(p);
					record = p();
					state = StateGuard(record, { mutable });
					handler && handler(record)
				}
			}
		}
	});
}

// const ImutableArray = (array, handler) => {
// 	let state = StateGuard(array, { mutable: false });
// 	const proxy = new Proxy(new Function, {
// 		get: (target, prop, parent) => {
// 			if (array.hasOwnProperty(prop)) {
// 				const p = array[prop];
// 				return isPrimitive(p)
// 					? p
// 					: CreateProxy(p, { mutable: true })
// 			} else if (Array.prototype.hasOwnProperty(prop)) {
// 				return Array.prototype.bind(array);
// 			}
// 		},
// 		set: (target, prop, value) => {
// 			if(!array.hasOwnProperty(prop) || array[prop] !== value) {
// 				array = state();
// 				array[prop] === value;
// 			}
// 		},
// 		apply: ( target, thisArg, args ) => {
// 			Object.freeze(array);
// 			state = StateGuard(array);
// 			handler && handler(array);
// 			return array;
// 		}
// 	})
// }
//
// const MutableArray = (array, handler) => {
// 	let state = StateGuard(array, { mutable: true });
// 	const defineMutatorFn = (len, pop) => {
// 		value: (...args) => {
// 			if ( args.length >= len ) {
// 				array = state();
// 			}
// 			return Array.prototype[prop].appy(array, args);
// 		}
// 	};
// 	const mutators = Object.define({}, map(mutatorList, defineMutatorFn));
// 	const proxy = new Proxy(new Function, {
// 		get: (target, prop, parent) => {
// 			if (array.hasOwnProperty(prop)) {
// 				const p = array[prop];
// 				return isPrimitive(p)
// 					? p
// 					: CreateProxy(p, { mutable: true })
// 			} else if (mutators.hasOwnProperty(prop)) {
// 				return mutators[prop];
// 			} else if (Array.prototype.hasOwnProperty(prop)){
// 				return Array.prototype.bind(array);
// 			}
// 		},
// 		set: (target, prop, value) => {
// 			if(!array.hasOwnProperty(prop) || array[prop] !== value){
// 				array = state();
// 				array[prop] === value;
// 			}
// 		},
// 		apply: ( target, thisArg, args ) => {
// 			Object.freeze(array);
// 			state = StateGuard(array);
// 			handler && handler(array);
// 			return array;
// 		}
// 	});
// }
//
// const spawnChildProxy = (childrenProxies, prop, p, parent, mutable, log) => {
// 	if (childrenProxies[prop] == null) {
// 		childrenProxies[prop] = CreateProxy(p, {
// 			parent,
// 			property: prop,
// 			mutable,
// 			log
// 		});
// 	}
// 	return childrenProxies[prop];
// }

// const StateFactory = (state, {parent, property, mutable} = {}) => {
// 	let dirty = false;
// 	return ({ stateUpdate, mutate, freeze, log }) => {
// 		state = (!stateUpdate || (mutate ? dirty : mutable && mutable !== dirty)) ? state : copy(state);
// 		console.log('++FACTORY++')
// 		console.log({ stateUpdate, mutate, dirty, mutable, cond: [!stateUpdate, mutate, dirty, mutable] })
// 		console.log('+++++++++++')
// 		if (isCallable(stateUpdate)) {
// 			stateUpdate(state);
// 		} else if (stateUpdate) {
// 			state = stateUpdate;
// 		}
// 		if ( !mutate ) {
// 			if ( stateUpdate && !dirty && parent != null ) parent[property] = state;
// 		}
// 		dirty = mutate;
// 		freeze && Object.freeze(state);
// 		return state;
// 	};
// }

// const mutators = {
// 	push: true
// };

// const CreateProxy = () => false; // (record, { parent, property, handler, mutable, log } = {}) => {
// 	let proxy,
// 			isArray = Array.isArray(record),
// 			childrenProxies = {},
//
// 			state = StateGuard(record, { mutable });
//
// 	return proxy = new Proxy(new Function, {
// 		ownKeys: (target) => Reflect.ownKeys(target),
// 		apply: ( target, thisArg, args ) => {
// 			// console.log('==APPLY==')
// 			// console.log({ property, target, args, parent, isArray, record });
// 			// console.log("=======")
//
// 			// console.log({ property, record, isCallable: isCallable(record), apply: {target, thisArg, args} })
// 			// console.log('===APPLY===')
// 			if(isCallable(record)){
// 				console.log('Simple call!!!!!!!!!!!!');
// 				return record.apply(thisArg, args);
// 			}
// 		  const [ stateUpdate, options ] = args;
// 			if( !args.length ){
// 				record = state({
// 					stateUpdate: mutable
// 						? (record) => each(record, applyToObjectKeys(proxy))
// 						: false,
// 					mutate: false,
// 					freeze: true,
// 					// log: true
// 				});
// 				handler && handler(record);
// 				return record;
// 			} else {
// 				// mutable = true;
// 				const subProxy = CreateProxy(record, {
// 					mutable: true,
// 					log: true,
// 					handler: proxyResult => console.log({proxyResult})
// 				});
// 				if (isPrimitive(stateUpdate)) {
// 					throw new Error(ERR_STATE_UPDATE)
// 				} else if (isCallable(stateUpdate)) {
// 					stateUpdate(subProxy);
// 				} else {
// 					Object.assign(subProxy, stateUpdate);
// 				}
// 				// mutable = false;
// 				record = state({
// 					stateUpdate: subProxy(),
// 					mutate: false,
// 					freeze: true,
// 					// log: true
// 				});
// 				return record;
// 			}
// 		},
// 		get: (target, prop, parent) => {
// 			console.log("==GET==")
// 			console.log({ property, target, prop, parent, isArray, record });
// 			console.log("=======")
// 			let p = record[prop];
// 			if(isArray && mutators[prop] != null && p === record.constructor.prototype[prop]){
// 				console.log('=====IS==ARRAYISH=====')
// 				return (...args) => {
// 					// console.log({p, record})
// 					record = state({
// 						stateUpdate: (record) => {
// 							p.apply(record, args);
// 							// proxy();
// 						},
// 						mutate: mutable,
// 						log: true
// 					});
// 				};
// 			}
// 			return isPrimitive(p)
// 				? p
// 				// : isCallable(p)
// 				// 	? p.bind(proxy) // maybe it should be binded to Proxy instead
// 					: spawnChildProxy(childrenProxies, prop, p, parent, mutable);
// 		},
// 		set: (target, prop, value) => {
// 			// console.log('==SET==')
// 			// console.log({ property, target, prop, value, isArray, record });
// 			// console.log("=======")
//
// 			// console.log({ target, prop, value })
// 			// console.log('SET')
// 			const condition = state[prop] !== value;
// 			if( condition ){
// 				record = state({
// 					stateUpdate: (record) => record[prop] = value,
// 					mutate: mutable
// 				});
// 				delete childrenProxies[prop];
// 				// should childrenProxies allways be deleted (for deleteProperty)?
// 				mutable || handler && handler(record);
// 			}
// 			return true;
// 		},
// 		deleteProperty: (target, prop) => {
// 			const condition = record.hasOwnProperty(prop);
// 			if( condition ){
// 				record = state({
// 					stateUpdate: (record) => delete record[prop],
// 					mutate: mutable
// 				});
// 				delete childrenProxies[prop];
// 				// should childrenProxies allways be deleted (for deleteProperty)?
// 				mutable || handler && handler(record);
// 			}
// 		}
// 	});
// }

module.exports = {
	CreateState,
	CreateProxy
}
// state.search.term = '';
// s1 = state();
// state.search.term = 'asd'
// s2 = state();
// s3 = state((DRAFT) => {
// 	state.items.push(1,2,3);
// });
// s2 === s3
