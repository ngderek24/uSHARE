var SocketMgr = module.exports = {
	active: new Array(),
	count: function(){
		return SocketMgr.active.length;
	},
	add: function(uid, rid){
		SocketMgr.active.push({ uid: uid,
														rid: rid
													});
	},
	remove: function(uid){
		for(var i = 0; i < SocketMgr.active.length; i++){
			if(SocketMgr.active[i].uid == uid){
				SocketMgr.active.splice(i, 1);
				break;
			}
		}
	},
	lastConnected: function(){
		return SocketMgr.active[SocketMgr.count()-1];
	}
}