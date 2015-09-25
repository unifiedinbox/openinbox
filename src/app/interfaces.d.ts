// Override TS's DOMTokenList to support 2-argument toggle
interface DOMTokenList {
	toggle(token: string, forceState?:boolean): boolean;
}

// Interface representing generic high-level format of all list service responses
interface IListServiceResponse {
	response:{
		data:any[];
	}[];
}
