const { isPrimitive, copyObject, emptyObject } = require('../Utils');
const CreateState = (state = {}) => {
	let listeners = [];
	const subscribe = (fn) => { listeners = listeners.concat(fn) };
	const unsubscribe = (fn) => { listeners = listeners.filter(l => l != fn) };
	const handler = ( state ) => {
		listeners.map((fn) => fn({state}) )
	};
	const observer = CreateProxy(state, {handler});

	return {
		state: observer,
		subscribe,
		unsubscribe
	};
}

const isCallable = (f) => typeof f === 'function';

const CreateProxy = (record, { parent, property, handler } = {}) => {
	return new Proxy(record, {
		get: (target, prop, parent) => {
			var p = record[prop];
			return isPrimitive(p)
				? p
				: isCallable(p)
					? p.bind(record)
					: CreateProxy(p, {
						parent,
						property: prop
					});
		},
		deleteProperty: (target, prop) => {
			record = copyObject(record);
			delete record[prop];
			if (parent != null){
				parent[property] = record;
			}
		},
		apply: (...args) => {
			console.log({ record, args })
			record(...args)
		},
		set: (target, prop, value) => {
			record = copyObject(record);
			record[prop] = value;
			if (parent != null){
				parent[property] = record;
			}
			handler && handler(record);
			return true;
		}
	});
}

module.exports = {
	CreateState,
	CreateProxy
}
