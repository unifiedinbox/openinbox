var eTypeMap:{ [key:string]:string } = {
	E: 'email',
	M: 'facebook',
	L: 'linkedin',
	A: 'twitter'
};

// Compute array of connection type values once (used by forEachConnectionType)
var connectionTypes = Object.keys(eTypeMap).map(function (key) {
	return eTypeMap[key];
});

/**
 * Given an eType code, converts to the service it represents.
 */
export function toConnectionType(eType:string):string {
	return eTypeMap[eType];
}

/**
 * Iterates through the known eType codes.
 */
export function forEachType(callback:(value:string, index:number) => void, context?:any) {
	Object.keys(eTypeMap).forEach(callback, context);
}

/**
 * Iterates through the known connection types.
 */
export function forEachConnectionType(callback:(value:string, index:number) => void, context?:any) {
	connectionTypes.forEach(callback, context);
}
