const { isPrimitive, copyObject } = require('../Utils');
var CreateState = (state = {}) => {
	let listeners = [];
	const subscribe = (fn) => { listeners = listeners.concat(fn) };
	const unsubscribe = (fn) => { listeners = listeners.filter(l => l != fn) };
	const handler = ( state ) => { listeners = listeners.map(() => ({state}) ) };
	const observer = CreateProxy(state, {handler});

	return {
		state: observer,
		subscribe,
		unsubscribe
	};
}

var CreateProxy = (record, { parent, property, handler } = {}) => {
	return new Proxy(record, {
		get: (target, prop, parent) => {
			var p = record[prop];
			return isPrimitive(p)
				? p
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
		set: (target, prop, value) => {
			record = copyObject(record);
			record[prop] = value;
			if (parent != null){
				parent[property] = record;
			}
			handler && handler(record);
		}
	});
}

module.exports = {
	CreateState,
	CreateProxy
}
