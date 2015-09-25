/// <amd-dependency path="mayhem/templating/html!app/views/Loading.html" />

import app = require('../ui/app');
import LoadingViewModel = require('app/viewModels/Loading');

var Loading = require <any> ('mayhem/templating/html!app/views/Loading.html');

app.run().then(function () {
    var loading = new Loading({
        app: app,
        model: new LoadingViewModel({
            message: 'The future depends on what we do in the present.',
            author: 'Mahatma Gandhi'
        })
    });

    app.get('ui').set('view', loading);
});

export = app;
