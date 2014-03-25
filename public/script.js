(function() {

	var  servers = {
	'iceServers': [
		{'url': "stun:stun.l.google.com:19302"}
	]
},

	videoConstraints = {
		'mandatory': {
			'OfferToReceiveVideo': true,
			'OfferToReceiveAudio': true
		} 
		
	},

	rtcPeerConnection = window.RTCPeerConnection || 
						window.webkitRTCPeerConnection ||
						window.mozRTCPeerConnection,

	rtcIceCandidate   = window.RTCIceCandidate ||
						window.webkitRTCIceCandidate ||
						window.mozRTCIceCandidate,

	rtcSessionDescription = window.RTCSessionDescription ||
							window.webkitRTCSessionDescription ||
							window.mozRTCSessionDescription,

	socket = io.connect("http://localhost"),

	options = {
	    optional: [
	        {DtlsSrtpKeyAgreement: true},
	        {RtpDataChannels: true}
	    ]
	},

	pc;

	var isInitiator = false;

	
	socket.on('initiatorFound', function(data) {
		isInitiator = data.setInitiator;
		console.log("Is Initiator? " + isInitiator);
	});


	navigator.getMedia = (
			navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia
		);

	var localStream;
	navigator.getMedia(
		{video: true, audio: true},
		function(stream) {
			var video = document.getElementById("localView");
			video.src = window.URL.createObjectURL(stream);
			console.log("Add Stream");
			sendMessage('streamAdd', {streamAdded: 'stream-added'});
			localStream = stream;
			createPeerConnection();
			pc.addStream(localStream);

			if(isInitiator)
			{
				callPeer();
			}
			
			
		},
		function(err) {
    		console.log("The following error occured: ");
    		console.dir(err);
   		}

	);


	function sendMessage(type, message)
	{
		console.log("Sending Message");
		socket.emit('message',{
			"type": type,
			"message": message
		});
	}

	function createPeerConnection() {

		pc = new rtcPeerConnection(servers, options);
		console.dir(pc);

		pc.addStream(localStream);

		pc.onicecandidate = function(evt) {
			if(evt.candidate == null) return; 
			pc.onicecandidate = null;			

			console.log("Send Ice Candidate");
			sendMessage("iceCandidate", JSON.stringify(evt.candidate));
		};

		pc.onaddstream = function(evt) {
			document.body.innerHTML += "<video id='remoteVideo' autoplay></video>";
			var remoteVid = document.getElementById("remoteVideo");
			remoteVid.src = window.URL.createObjectURL(evt.stream);
		};

	}

	/*
	
	function getMediaStream(stream)
	{
		var video = document.getElementById("localView");
		video.src = window.URL.createObjectURL(stream);
		console.log("Add Stream");
		pc.addStream(stream);

		connect();

	}	

	*/

	function callPeer() {

		pc.createOffer(function (offer) {
				pc.setLocalDescription(offer, function() {
					sendMessage("offer", JSON.stringify(offer));
				});
				console.log("Send Offer");
			}, function(err) { console.log("Offer Error: " + err) },
				videoConstraints
			);

	}

	function answerPeer() {

		pc.createAnswer(function(answer) {
			pc.setLocalDescription(answer);
			sendMessage("answer", JSON.stringify(answer))
		}, function(err) { console.log("Sending Answer Error: " + err) },
			videoConstraints
		);

	}

	socket.on('message', function(message) {
		console.log("CONSOLE MESSAGE:");
		console.dir(message);

		if(message.type == 'streamAdd') {
			console.log('Stream was added');
			createPeerConnection();

			if(isInitiator) {
				callPeer();
			}

		} else if(message.type == 'offer') {

			pc.setRemoteDescription( new rtcSessionDescription(JSON.parse(message.message)));
			
			if(!isInitiator)
			{
				console.log("Sending Answer");
				answerPeer();
			}


		} else if(message.type == 'answer') {
			pc.setRemoteDescription( new rtcSessionDescription(JSON.parse(message.message)));
		} else if(message.type == 'iceCandidate') {
			console.log("Get Ice Candidate");
			pc.addIceCandidate(new rtcIceCandidate(JSON.parse(message.message)) );
		}

	});
/*
	socket.on('streamAdd', function(message) {
		console.dir(message);
		if(message.streamAdded)
		{
			console.log("A stream was added");
			connect();
		}
	});
	*/

	/*function connect() {
		
		if(isInitiator) {
			console.log("Initiator Called Connect");
			

			socket.on('message', function(message) {
				if(message.type == "answer") {
					pc.setRemoteDescription( new rtcSessionDescription(JSON.parse(message.message)));
				}
			});


		} else {
			console.log("Non-Initiator Called Connect");
			socket.on('message', function(message) {

				if(message.type == "offer") {
					pc.setRemoteDescription( new rtcSessionDescription(JSON.parse(message.message)));

					pc.createAnswer(function(answer) {
						pc.setLocalDescription(answer);
						console.log("Send Answer");
						sendMessage("answer", JSON.stringify(answer))
					}, function(err) { console.log("Sending Answer Error: " + err) },
						videoConstraints
					);

				}

			});
		}


	}
	*/

	/*

	socket.on('message', function(message) {

		console.log("Received Message: ");
		console.dir(message);

		if(message.message.sdp) {

			console.log("Received Offer");

			var offer = new rtcSessionDescription(JSON.parse(message.message.sdp));
			pc.setRemoteDescription(offer, function() {
				if(pc.remoteDescription.type == "offer")
				{
					

				}
			});


			
		} else if(message.type == "answer")
		{
			console.log("Received Answer");
			pc.setRemoteDescription(new rtcSessionDescription(JSON.parse(message.message)));

		} else if(message.type == "iceCandidate") {
			console.log("Received Ice Candidate");
			//console.log(message.message);
			pc.addIceCandidate(new rtcIceCandidate(JSON.parse(message.message)));

		}


	});

*/

}());