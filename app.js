var app = {
	ownerUID : null,
	ownerFB : null,
	ownerGoogle : null,
	endpoint : "http://api-techbrowser.appspot.com/",
	googleAppKey : "",
	facebookAppKey: '',
	
	requestUserLogin : function() {
		var loginDialog = Component.fromPath("component/login");
		SexyLightbox.initialize();
		SexyLightbox.showDOM(null, loginDialog, 400, 150, true, "#000000");
		loginDialog.dialog = SexyLightbox;
		loginDialog.init();
		loginDialog.on("pending", function(provider){
			SexyLightbox.close();
		});
		loginDialog.on("selected", function(provider){
			SexyLightbox.close();
			app.setOwnerUID(provider);
		});
	},
	googleUserLogin : function(uid) {
		if(uid != null) {
			this.setOwnerUID(uid);
			this.ownerGoogle = uid;
		}
	},
	facebookUserLogin : function(uid) {
		if(uid != null) {
			this.setOwnerUID(uid);
			this.ownerFB = uid;
		}
	},
	hookToSocialLogins : function() {
		var _self = this;
		google.friendconnect.container.initOpenSocialApi({
			site : this.googleAppKey,
			onload : function(securityToken) {
				var req = opensocial.newDataRequest();
				req.add(req.newFetchPersonRequest("VIEWER"), "viewer_data");
				req.send(onData);
			}
		});

		// callback handler for datarequest.send() from above
		function onData(data) {
			var viewer_info = document.getElementById("viewer-info");
			if (data.get("viewer_data").hadError()) {
				_self.googleUserLogin(null);
			} else {
				var viewer = data.get("viewer_data").getData();
				_self.googleUserLogin(viewer.getId() + "@googleconnect.com");
			}
		};
		
		FB.getLoginStatus(function(response) {
		  if (response.session) {
			  _self.facebookUserLogin(response.session.uid+"@facebookconnect.com");
		  } else {
			  _self.facebookUserLogin(null);
		  }
		});
		
		FB.Event.subscribe('auth.sessionChange', function(response) {
		    if (response.session) {
		    	_self.facebookUserLogin(response.session.uid+"@facebookconnect.com");
		    } else {
		    	_self.facebookUserLogin(null);
		    }
		});

	},
	hasUser : function() {
		return this.ownerUID != null;
	},
	getProvider : function() {
		return this.ownerUID.split("@")[1];
	},
	setOwnerUID : function(uid) {
		this.ownerUID = uid;
		$("#loggedbox")[0].setProvider(this.getProvider());
		$(".submitButton").text("add as "+this.getProvider());
	}
};

FB.init({appId: app.facebookAppKey, status: true, cookie: true, xfbml: true});
Component.overrideCurrent();
app.hookToSocialLogins();

window.addEventListener("load", windowLoaded, false);
function windowLoaded() {
  chrome.tabs.getSelected(null, function(tab) {
    $("#addbox .addDialog")[0].setURL(tab.url);
  });
}

console.log(window.location);