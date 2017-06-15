docIsSet = new ReactiveVar(false);
contentIsSet = new ReactiveVar(false);

var docContent;
var showEditor = false;
Session.set("showEditor", false);

Meteor.subscribe('documents', function() {
    docIsSet.set(true);
});

Meteor.subscribe("editingUsers");

Router.configure({
	layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
	this.render("navbar",{to: "header"});
	this.render("docList",{to: "main"});
});

Router.route('/documents/:_id', function () {
	Session.set("docid", this.params._id);
	this.render("navbar",{to: "header"});
	this.render("docItem",{to: "main"});
});

var setupCurrentDocument = function() {
	
	var doc;
	
		if (!Session.get("docid")) {
			doc = Documents.findOne();
			if (doc) {
				Session.set("docid", doc._id);
				//console.log("the doc content without session:");
				//console.log(doc.content);
				if(doc.content){
					docContent = doc.content;
					contentIsSet.set(true);
				}
				
			}
		} else {
			doc = Documents.findOne({_id:Session.get("docid")});
			if(doc.content){
					docContent = doc.content;
					contentIsSet.set(true);
				}

		}
	
	
	//$("#viewer_iframe").contents().find("html").html(doc.content);

	//console.log(doc.content);
	//startingContent = doc.content;
	//editor.setValue(doc.content);
};

Tracker.autorun(function(){
	
	
    if(!docIsSet.get()) {
        return;
    }
	
	
	setupCurrentDocument();

    // Do some no-markup stuff with the data
    // (eg. creating canvas objs and drawing on them)
});




Tracker.autorun(function(){

			
		
			
		if(!contentIsSet.get()) {
	
				showEditor = false;
		}
			
		if(contentIsSet.get()) {
		
			showEditor = true;
			
			//console.log(showEditor);
			Session.set("showEditor", true);
			$("#viewer_iframe").contents().find("html").html(docContent);
		}
			
});





Accounts.ui.config({
		passwordSignupFields: "USERNAME_AND_EMAIL"
	});

Template.viewer.helpers({
	isReady: function() {

		
			return Session.get("showEditor");
	
		
		
		
  }
});

Template.editor.helpers({
  docid:function(){
		console.log("docidset in editor");
		console.log(Session.get("docid"));
		console.log("doc content in editor");
		console.log(docContent)
		return Session.get("docid");
	},
	config:function(){
		return function(editor){
				console.log("config is running");
				editor.setOption("lineNumbers", true);
        editor.setOption("theme", "twilight");
				editor.setValue(docContent);
		
	
				editor.on("change", function(cm_editor, info){
					console.log("changes detected");
					Meteor.call("updateContent", cm_editor.getValue(), Session.get("docid"));
					updateContent();
					//$("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
					Meteor.call("addEditingUser", Session.get("docid"));
			});
		}
	}
});

Template.editingUsers.helpers({
  users:function(){
		console.log("Editing users helper is running");
		var doc, eusers, users;
		doc = Documents.findOne();
		if (!doc) {return;}
		eusers = EditingUsers.findOne({docid:Session.get("docid")});
		
		if (!eusers) {return;}
		users = new Array();
		var i = 0;
		for (var user_id in eusers.users) {
			
			users[i] = eusers.users[user_id];
			
			i++;
		}
		return users;
	}
});

Template.navbar.events({
	"click .js-load-doc":function(event){
		Session.set("docid", this._id);
	}
});

Template.navbar.helpers({
  documents:function(){
		return Documents.find();
	}
});

Template.docList.events({
	"click .js-add-doc":function(event){
		event.preventDefault();
		if (!Meteor.user()){
			alert("You need to login first.")		
		}
		else{
			var id = Meteor.call("addDoc", function(err, res){
				if (!err) {
					console.log("Callback received, id: " + res);
					Session.set("docid", res);
				}
			});
		}
	}
});

Template.docMeta.helpers({
  document:function(){
		return Documents.findOne({_id:Session.get("docid")});
	},
	canEdit:function(){
		var doc = Documents.findOne({_id:Session.get("docid")});

		if (doc) {
			if (doc.owner == Meteor.userId()) {
					return true;
			}
		}
		
		return false;
	},
	isChecked: function() {
		var doc = Documents.findOne({_id:Session.get("docid")});
		console.log("ischecked")
		if(doc.isPrivate){
			return true
		} 
    return false; 
  }
});

Template.docMeta.events({
	"click .js-tog-private":function(event){
		var doc = {_id:Session.get("docid"), isPrivate:event.target.checked};
		Meteor.call("updateDocPrivacy", doc);
	}
});

Template.editableText.helpers({
	userCanEdit : function(doc, Collection){
		doc = Documents.findOne({_id:Session.get("docid"), owner:Meteor.userId()});
		if(doc){
			return true;
		} else {
			return false;
		}
	}
})




var updateContent = function() {

	var doc;
	if (!Session.get("docid")) {
		doc = Documents.findOne();
		if (doc) {
			$("#viewer_iframe").contents().find("html").html(doc.content);
		}
	} else {
		doc = Documents.findOne({_id:Session.get("docid")});
		$("#viewer_iframe").contents().find("html").html(doc.content);
	}
};

Template.docList.helpers({
  documents:function(){
		return Documents.find();
	}
});