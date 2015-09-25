var data = [
	{
		bcc: <string[]> [],
		body: 'The quick brown fox jumps over the lazy dog!',
		cc: <string[]> [],
		dtDate: '2015-03-25 08:45:28',
		forwarded: 'n',
		email_from: 'john@doe.com',
		from: 'John Doe',
		msg_index: '', // will be mixed in in mock request handler
		replied: 'n',
		showsubject: 'Subject',
		to: [ 'mike@smith.com', 'fred@williams.com' ],
		vchMessageID: '86A8.4070807@test.i'
	},
	{
		bcc: <string[]> [ 'john@doe.com', 'fred@williams.com', 'bob@jacobson.com', 'tom@yessir.com'],
		body: 'The dog isn\'t lazy!',
		cc: [ 'todd@smith.com', 'john@doe.com', 'fred@williams.com', 'bob@jacobson.com', 'tom@yessir.com' ],
		dtDate: '2015-03-25 12:21:53',
		forwarded: 'n',
		email_from: 'mike@smith.com',
		from: 'Mike Smith',
		msg_index: '', // will be mixed in in mock request handler
		replied: 'y',
		showsubject: 'RE: Subject',
		to: [ 'john@doe.com', 'fred@williams.com', 'bob@jacobson.com', 'tom@yessir.com' ],
		vchMessageID: '86A8.4070808@test.i'
	},
	{
		bcc: <string[]> [],
		body: 'Well, the fox is making the dog look bad then!',
		cc: [ 'todd@smith.com' ],
		dtDate: '2015-03-25 12:48:27',
		forwarded: 'n',
		email_from: 'john@doe.com',
		from: 'John Doe',
		msg_index: '', // will be mixed in in mock request handler
		replied: 'n',
		showsubject: 'RE: Subject',
		to: [ 'mike@smith.com', 'fred@williams.com' ],
		vchMessageID: '86A8.4070809@test.i'
	}
];

export = data;
