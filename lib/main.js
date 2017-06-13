
this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");
startingContent = " ";
startContentSet = false;

Meteor.methods({
	addDoc:function(){
		var doc;
		if (!this.userId) {
			return;
		}
		else {
			doc = {owner:this.userId, createdOn:new Date(),
						title:"my new doc", isPrivate:false, content: " "};
			var id = Documents.insert(doc);
			console.log("id :" + id);
			return id;
		}
	},
	updateDocPrivacy:function(doc){
		var realDoc = Documents.findOne({_id:doc._id, owner:this.userId});
		
		if(realDoc){
			realDoc.isPrivate = doc.isPrivate;
			Documents.update({_id:doc._id}, realDoc);
		}
	},
	addEditingUser:function(docId){
//		console.log("ADDING EDITING USER");
		var doc, user, eusers;
		doc = Documents.findOne({_id:docId});
	
		if (!doc){return;}
//		console.log("I am running");
		if (!this.userId){return;}
//		console.log("I am also running");
//		console.log(this.userId);
//		console.log(Meteor.user());
		//console.log(Meteor.user().profile);
		//user = Meteor.user().profile;
		user = Meteor.user();
		
		
		eusers = EditingUsers.findOne({docid:doc._id});
		//console.log(eusers);
		
		if (!eusers) {
			eusers = {
				docid:doc._id,
				users:{},
			};
		}
		user.lastEdit = new Date();
		user.userName = Meteor.user().username;
//		
//		console.log("USER");
//		console.log(user);
		eusers.users[this.userId] = user;
		
		EditingUsers.upsert({_id:eusers._id}, eusers);
	},
	updateContent:function(content, docId){
		var doc;
		doc = Documents.findOne({_id:docId});
		
		if(doc){
			if(content){
				doc.content = content;
			}
		} else {
			doc = Documents.findOne();
			if (content){
				doc.content = content;
			}
		}
		
		Documents.update({_id:doc._id}, doc);
		
		
	},
	getContent:function(docId){
		var doc;
		doc = Documents.findOne({_id:docId});
		
		if(doc){
			  startingContent = doc.content;
//				console.log("found doc");
				return;
		} else {
			doc = Documents.findOne();
			if (!doc){
//				console.log("Doc missing");
				return;
			} else {
				startingContent = doc.content;
				return;
			}
		}	
	}
})

