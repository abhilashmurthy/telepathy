// Global variables for your appid and appsecret values.  You can find this on your app console at developer.expectlabs.com.
// You can copy and paste them manually into the UI or enter them here directly and they will be set as the default UI values.
var APPID = '329cc08e03db57ee09cc00ff45af244c7aa42467';
var APPSECRET = '8f149b8ea901b3bbf821c67e70e4344a147722e6';

// Temporary credentials for a test user account.  Change this to anything you like.
var USERID = 'xumx';
var USERNAME = 'Max';

// Test session name and privacy mode setting.  You can change this as well.
var SESSION_NAME = 'Chat';
var PRIVACY_MODE = 'inviteonly';

PeopleData = _.map(PeopleData, function(people) {
    return {
        title: people.name,
        originurl: 'https://facebook.com/' + people.id,
        facebookID: people.id,
        image: {
            url: 'http://graph.facebook.com/' + people.id + '/picture?height=200',
            thumburl: 'http://graph.facebook.com/' + people.id + '/picture'
        },
        gender: people.gender,
        occupation: people.occupation,
        education: people.education,
        currentLocation: people.location,
        hometown: people.hometown,
        type: 'person',
        language: 'eng',
        source: {
            name: 'Facebook',
            url: 'www.facebook.com',
            icon: 'www.facebook.com/favicon.ico'
        }
    }
});

MovieData = _.map(MovieData, function(movie) {
    var title = movie.title;
    var originurl = movie.links.alternate;
    var description = movie.synopsis;
    var type = 'movie';

    var text = movie.synopsis;
    var actors = _.pluck(movie.abridged_cast, 'name');
    var characters = _.flatten(_.pluck(movie.abridged_cast, 'characters'));
    var language = 'eng';
    var imageUrl = movie.posters.original;
    var imageThumbUrl = movie.posters.thumbnail;
    var sourceName = 'Rotten Tomatoes';
    var sourceUrl = 'www.rottentomatoes.com';
    var sourceIcon = 'http://www.rottentomatoes.com/favicon.ico';

    return {
        title: title,
        originurl: originurl,
        description: description,
        type: type,
        text: text,
        year: movie.year,
        actors: actors,
        language: language,
        image: {
            url: imageUrl,
            thumburl: imageThumbUrl
        },
        source: {
            name: sourceName,
            url: sourceUrl,
            icon: sourceIcon
        }
    };
});

if (Meteor.isClient) {

    // admin token: 48ae04a4acb418811173366b074ca5fe2417bb90

    $(document).ready(function() {
        $('#appid').html(APPID);
        $('#appsecret').html(APPSECRET);

        if (appIdNotSet()) return;
        init();
    });

    // This method initializes the MindMeld JS SDK with the provided APPID value.
    function init() {
        var config = {
            'appid': APPID,
            'onInit': function() {
                log("MindMeld JavaScript SDK version " + MM.version + " loaded.");
            }
        };
        MM.init(config);
    }

    // ENTER APPID:
    // Set the appid based on the value entered into the 'appid' field in the UI.  If the appid value is valid, then
    // attempt to initialize the MindMeld API object.
    $(document).on('blur', '#appid', function(e) {
        APPID = $(this).val();
        if (appIdNotSet()) return;
        init();
        log("Appid set.  Make sure your appsecret value is also set. It can be found in the developer console.");
    });

    // ENTER APPSECRET:
    // Set the appsecret based on the value entered into the 'appsecret' field in the UI.  Display an error if the value is invalid.
    $(document).on('blur', '#appsecret', function(e) {
        APPSECRET = $(this).val();
        if (appSecretNotSet()) return;
        log("Appsecret set.  Now click 'request an access token' to get a token in order to access the MindMeld API.");
    });

    $(document).on('click', '.changeDeviceId', function() {
        var deviceID = $('#device').val();
        Tokens.upsert('registration_id', {
            $set: {
                value: deviceID
            }
        }, function() {
            log('Saved device registration id ' + deviceID);
        });
    });

    // STEP 1:
    // Request an admin access token when the button is clicked.  
    $(document).on('click', '.requestAdminToken', function() {
        if (appIsNotSet()) return;
        var onSuccess = function(response) {
            log("Admin token (" + MM.token + ") successfully retrieved " +
                "for the application " + response.appname + " (appid: " + response.appid + ").");
        };
        var onFail = function(error) {
            log("Error getting admin token:  (Type " + error.code + " - " + error.type + "): " + error.message + "  " +
                "Please make sure your appid and appsecret are set correctly.");
        };
        var credentials = {
            'appsecret': APPSECRET
        };
        MM.getToken(credentials, onSuccess, onFail);
    });

    // STEP 2:
    // Post a new document to your searchable documents collection.  This can also be done by using the Crawl Manager tool to
    // automatically crawl specific sites on the Web.
    $(document).on('click', '.postDocument', function() {
        if (tokenIsNotSet()) return;


        var onSuccess = function(response) {
            log("Successfully created document id " + response.data.documentid + ".");
        };
        var onFail = function(error) {
            log("Error posting document:  (Type " + error.code + " - " + error.type + "): " + error.message);
            log("Posting documents is not allowed with a user token.  Request an admin token before posting documents.");
        };

        _.each(MovieData, function(document, key, list) {
            log("Posting the document '" + document.title + "'."); // body
            MM.documents.post(document, onSuccess, onFail);
        });

        _.each(PeopleData, function(document, key, list) {
            log("Posting the document '" + document.title + "'."); // body
            MM.documents.post(document, onSuccess, onFail);
        });
    });

    // STEP 3:
    // Request an access token using Simple User Authentication when the button is clicked.  If a token is received, 
    // then set the active user, and then subscribe to update events for the user object and its associated collections.
    $(document).on('click', '.requestUserToken', function() {
        if (appIsNotSet()) return;
        var onSuccess = function(response) {
            Tokens.upsert('token', {
                $set: {
                    value: MM.token
                }
            });
            log("Your access token was successfully retrieved: " + MM.token + ".");
            log("Setting the active user to: " + response.user.name + " (userid: " + response.user.userid + ").");
            if (response.user && response.user.userid) MM.setActiveUserID(response.user.userid, subscribeToUserChannel);
        };
        var onFail = function(error) {
            log("Error getting access token:  (Type " + error.code + " - " + error.type + "): " + error.message + "  " +
                "Please make sure your appid and appsecret are set correctly.");
        };
        var credentials = {
            'appsecret': APPSECRET,
            'simple': {
                'userid': USERID,
                'name': USERNAME
            }
        };
        MM.getToken(credentials, onSuccess, onFail);
    });

    // Handle push updates for the active user and its associated collections.
    // Also subscribe to the custom event named 'CustomUserEvent'.
    function subscribeToUserChannel(response) {
        log("Subscribing to user channel: " + JSON.stringify(response.data.name) + ".");
        MM.activeUser.onUpdate(handleUpdate);
        MM.activeUser.sessions.onUpdate(handleUpdate);
        MM.activeUser.subscribe("CustomUserEvent", handleUpdate);
    }

    $(document).on('click', '.joinSession', function() {
        var sessionid = Tokens.findOne('session').value;
        MM.setActiveSessionID(sessionid, subscribeToSessionChannel);
        log("Joined session " + sessionid + ".");
    });


    // STEP 4:
    // Create a new session object when the button is clicked.  After the new session is created, subscribe to
    // updates for the session and its associated collections.
    $(document).on('click', '.createSession', function() {
        if (activeUserIsNotSet()) return;
        log("Creating new session with name '" + SESSION_NAME + "' and privacymode '" + PRIVACY_MODE + "'.");
        var onNewSession = function(response) {
            log("New session created with id " + response.data.sessionid + ".");
            Tokens.upsert('session', {
                $set: {
                    value: response.data.sessionid
                }
            });

            MM.setActiveSessionID(response.data.sessionid, subscribeToSessionChannel);
        };
        var onFail = function(error) {
            log("Error creating new session:  (Type " + error.code + " - " + error.type + "): " + error.message);
        };
        MM.activeUser.sessions.post({
            'name': SESSION_NAME,
            'privacymode': PRIVACY_MODE
        }, onNewSession, onFail);
    });

    // Handle push updates for the active session and its associated collections. 
    // Also subscribe to the custom event named 'CustomSessionEvent'.
    function subscribeToSessionChannel(response) {
        log('Subscribing to session channel: ' + JSON.stringify(response.data.name) + ".");
        MM.activeSession.onUpdate(handleUpdate);
        MM.activeSession.textentries.onUpdate(handleUpdate);
        MM.activeSession.entities.onUpdate(handleUpdate);
        MM.activeSession.documents.onUpdate(handleUpdate);
        MM.activeSession.articles.onUpdate(handleUpdate);

        MM.activeSession.activities.onUpdate(handleUpdate);
        MM.activeSession.liveusers.onUpdate(handleUpdate);
        MM.activeSession.invitedusers.onUpdate(handleUpdate);
        MM.activeSession.subscribe("CustomSessionEvent", handleUpdate);
    }

    // STEP 5:
    // Post a new text entry to the session you just created.
    $(document).on('click', '.postTextEntry', function() {
        if (activeSessionIsNotSet()) return;

        var message = prompt('message');
        log("Posting the textentry '" + message + "'.");
        Meteor.call('message', message);
    });

    // STEP 6:
    // Get documents for the active session.
    $(document).on('click', '.getDocuments', function() {
        if (activeSessionIsNotSet()) return;
        log("Retrieving documents for the current session.");
        MM.activeSession.documents.get();
    });

    // STEP 7:
    // Get entities for the active session.
    $(document).on('click', '.getEntities', function() {
        if (activeSessionIsNotSet()) return;
        log("Retrieving entities for the current session.");
        MM.activeSession.entities.get();
    });

    $(document).on('click', '.pushNotify', function() {
        log("Pushing");
        Meteor.call('pushNotify', {
            type: 'movie',
            payload: JSON.stringify({
                "title": "Interstellar",
                "originurl": "https://mindmeldv2.expectlabs.com/docredirect/0b1146b80c96b7297202ae69008d1bf9/?routing=FqIWN5WhLiIVh9nxLg5Cbu7Y2yJyF0_oSGrP0WBOn8pUgBLpv38mrQQmBSE_jumH-aINWCaY_4h0b8bHQ-o4Xg",
                "description": "With our time on Earth coming to an end, a team of explorers undertakes the most important mission in human history; traveling beyond this galaxy to discover whether mankind has a future among the stars. (C) Paramount",
                "type": "movie",
                "text": "With our time on Earth coming to an end, a team of explorers undertakes the most important mission in human history; traveling beyond this galaxy to discover whether mankind has a future among the stars. (C) Paramount",
                "actors": [
                    "Matthew McConaughey",
                    "Anne Hathaway",
                    "Jessica Chastain",
                    "Michael Caine",
                    "Casey Affleck"
                ],
                "language": "eng",
                "image": {
                    "url": "http://content9.flixster.com/movie/11/18/05/11180587_tmp.jpg",
                    "thumburl": "http://content9.flixster.com/movie/11/18/05/11180587_tmp.jpg"
                },
                "source": {
                    "name": "Rotten Tomatoes",
                    "url": "www.rottentomatoes.com",
                    "icon": "http://www.rottentomatoes.com/favicon.ico"
                },
                "created": 1415922652,
                "modified": 1415942438,
                "_analyzer": "standard",
                "year": "2014",
                "documentid": "0b1146b80c96b7297202ae69008d1bf9",
                "sort": null,
                "rank": 0.2138528
            })
        });
    });

    // STEP 8:
    // Publish a custom event on the channel for the currently active user.
    $(document).on('click', '.publishUserEvent', function() {
        if (activeUserIsNotSet()) return;
        log("Publishing a custom event on the user channel.");
        MM.activeUser.publish("CustomUserEvent", {
            'field1': 'This is a custom event',
            'field2': 'published on the user channel'
        });
    });

    // STEP 9:
    // Publish a custom event on the channel for the currently active session.
    $(document).on('click', '.publishSessionEvent', function() {
        if (activeSessionIsNotSet()) return;
        log("Publishing a custom event on the session channel.");
        MM.activeSession.publish("CustomSessionEvent", {
            'field1': 'This is another custom event',
            'field2': 'published on the session channel'
        });
    });

    // Utility methods.
    function log(msg) {
        $('#log').prepend("<div class='logentry'>" + msg + "</div>");
    }

    function logError(error) {
        $('#log').prepend("<div class='logentry error'>" + error + "</div>");
    }

    function handleUpdate(response) {
        if (!response.request) {
            log("Event received: " + JSON.stringify(response));
            return;
        }
        if (response.request.connectiontype) {
            var count = response.data.length;
            var msg = count + " object" + ((count == 1) ? "" : "s") + " received for the '" + response.request.connectiontype +
                "' collection of " + response.request.objecttype + " object (id=" + response.request.objectid + ").";
        } else {
            var msg = "Update received for " + response.request.objecttype + " object (id=" + response.request.objectid + ").";
        }
        log(msg);

        $('#json').html('<pre>' + JSON.stringify(response.data, null, '  ') + '</pre>');
    }
    var onError = function(error) {
        log("API error:  (Type " + error.code + " - " + error.type + "): " + error.message);
    };

    function tokenIsNotSet() {
        if (!MM.token) {
            alert('Please request an admin token first.');
            return true;
        }
        return false;
    }

    function activeUserIsNotSet() {
        if (!MM.activeUserId) {
            alert('Please request a user token first.');
            return true;
        }
        return false;
    }

    function activeSessionIsNotSet() {
        if (!MM.activeSessionId) {
            alert('Please create a session first.');
            return true;
        }
        return false;
    }

    function appIdNotSet() {
        if (APPID.length != 40) {
            logError('Please enter a valid APPID value. This can be found on your app console at developer.expectlabs.com.');
            return true;
        }
        return false;
    }

    function appSecretNotSet() {
        if (APPSECRET.length != 40) {
            logError('Please enter a valid APPSECRET value. This can be found on your app console at developer.expectlabs.com.');
            return true;
        }
        return false;
    }

    function appIsNotSet() {
        if (appIdNotSet() || appSecretNotSet()) return true;
        return false;
    }

    Template.hello.events({
        'click button': function() {
            // increment the counter when button is clicked
            Meteor.call('postToMindMeld');
        }
    });

    UI.registerHelper('deviceID', function() {
        return Tokens.findOne('registration_id').value;
    });
}

if (Meteor.isServer) {
    ServiceConfiguration.configurations.remove({
        service: "facebook"
    });

    ServiceConfiguration.configurations.insert({
        service: "facebook",
        appId: "612991088824178",
        secret: "e72103c40e92abc6dd11d04e641fdb37"
    });

    Meteor.startup(function() {

    });

    // Meteor.methods({
    // })
}
