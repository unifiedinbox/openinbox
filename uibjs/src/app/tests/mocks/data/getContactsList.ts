var data = [
	{
		intIndx: 1,
		name: 'Fred Williams',
		accounts: [ { eType: 'E', address: 'fred@williams.com' } ],
		imagepath: 'https://avatars0.githubusercontent.com/u/78551?v=3&s=460'
	},
	{
		intIndx: 2,
		name: 'Todd Smith',
		accounts: [
			{
				eType: 'E',
				address: 'todd.smith@gmail.com'
			},
			{
				eType: 'M',
				address: 'todd@smith.com'
			}
		],
		imagepath: 'https://avatars0.githubusercontent.com/u/78551?v=3&s=460'
	},
	{
		intIndx: 3,
		name: 'Mark Halverson',
		accounts: [
			{
				eType: 'A',
				address: 'mhalverson@outlook.com',
				fromaccountindx: 2
			}
		],
		imagepath: 'https://avatars0.githubusercontent.com/u/78551?v=3&s=460'
	},
	{
		intIndx: 4,
		name: 'Prashanth Raj',
		accounts: [
			{
				eType: 'A',
				address: 'prashanth@raj.net',
				fromaccountindx: 0
			}
		],
		imagepath: 'https://avatars0.githubusercontent.com/u/78551?v=3&s=460'
	},
	{
		intIndx: 5,
		name: 'Ana Vidovic',
		accounts: [
			{
				eType: 'A',
				address: 'ana@anavidovic.com',
				fromaccountindx: 1
			}
		],
		imagepath: 'https://avatars0.githubusercontent.com/u/78551?v=3&s=460'
	}
];

export = data;
