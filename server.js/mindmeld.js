var getToken = function(argument) {
    return Tokens.findOne('token').value;
}

var getSession = function(argument) {
    return Tokens.findOne('session').value;
}

var getRegistrationID = function() {
    return Tokens.findOne('registration_ids').value;
}

var lastResult = null;

Meteor.methods({
    message: function(text, callback) {
        if (lastResult && lastResult.type == 'movie' && /what time\?/i.test(text)) {

            Meteor.call('pushNotify', {
                type: 'url',
                title: 'Movie Timing',
                payload: {
                    url: 'https://www.yahoo.com/movies/film/' + lastResult.title
                }
            });

        } else if (/meet at/i.test(text)) {
            var location = _.last(text.split(/meet at/i));

            Meteor.call('pushNotify', {
                type: 'url',
                title: location,
                payload: {
                    url: 'https://www.google.com/maps/?q=' + location
                }
            });
        } else {

            Meteor.call('newTextEntry', {
                'text': text,
                'type': 'text',
                'weight': 1.0,
                "language": "eng"
            });

        }
        return "success";
    },
    newTextEntry: function(payload) {
        var token = getToken();
        var session = getSession();
        check(token, String);
        check(session, String);

        console.log('token', token);
        console.log('session', session);

        var url = 'https://mindmeldv2.expectlabs.com/session/' + session + '/textentries'

        HTTP.post(url, {
            data: payload,
            headers: {
                'X-MindMeld-Access-Token': token,
                'Content-Type': 'application/json'
            }
        }, function(error, response) {
            HTTP.get('https://mindmeldv2.expectlabs.com/session/' + session + '/documents?limit=1', {
                headers: {
                    'X-MindMeld-Access-Token': token
                }
            }, function(error, response) {
                var d = response.data.data[0];
                var payload;

                if (d.type == 'movie') {
                    payload = {
                        type: 'movie',
                        title: d.title,
                        payload: JSON.stringify(d)
                    }
                }

                lastResult = d;

                Meteor.call('pushNotify', payload);
            });
        });
    },
    pushNotify: function(payload) {
        var key = Tokens.findOne('registration_id').value;
        check(key, String);

        console.log(payload);
        HTTP.post('https://android.googleapis.com/gcm/send', {
            data: {
                registration_ids: [key],
                data: payload
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'key=AIzaSyDrGlzlQFtqZCxxX3XrhYVNtybKs3ch-Lo'
            }
        }, function(error, response) {
            console.log(error, response);
        });
    }
});
