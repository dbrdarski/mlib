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

const getOrCreateChildrenProxies = (childrenProxies, prop, p, parent) => {
	if (childrenProxies[prop] == null) {
		childrenProxies[prop] = CreateProxy(p, {
			parent,
			property: prop
		});
	}
	return childrenProxies[prop];
}
getOrCreateDraft = (record) => {
	let clean = true,
			draft = null;
	return (mutate) => {
		if (mutate) => {
			draft = copyObject(record);
			clean = false;
		};
		return clean ? record : draft;
	};
}

const CreateProxy = (record, { parent, property, handler } = {}) => {
	let childrenProxies = {},
			getDraft = getOrCreateDraft(record);

	return new Proxy(record, {
		get: (target, prop, parent) => {
			var p = record[prop];
			return isPrimitive(p)
				? p
				: isCallable(p)
					? p.bind(record)
					: getOrCreateChildrenProxies(childrenProxies, prop, p, parent);
		},
		deleteProperty: (target, prop) => {
			var draft = getDraft(true);
			delete draft[prop];
			if (parent != null){
				parent[property] = draft;
			}
		},
		// apply: (...args) => {
		// 	console.log({ record, args })
		// 	record(...args)
		// },
		apply: () => record,
		set: (target, prop, value) => {
			var draft = getDraft(true);
			draft[prop] = value;
			if (parent != null){
				parent[property] = draft;
			}
			handler && handler(draft);
			return true;
		}
	});
}

module.exports = {
	CreateState,
	CreateProxy
}
