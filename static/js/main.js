// Variables 
var leftchannel = [];
var rightchannel = [];
var recorder = null;
var recording = false;
var recordingLength = 0;
var volume = null;
var audioInput = null;
var sampleRate = null;
var audioContext = null;
var context = null;
var outputString;

// Check for the existence of navigator.mediaDevices.getUserMedia
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
				navigator.mediaDevices.getUserMedia || navigator.msGetUserMedia;

// if getUserMedia
function success(e) {
	// Create audio context
	audioContext = window.AudioContext || window.webkitAudioContext;
	audio_context = new audioContext;

	// retrieve sample rate for wav packaging
	sampleRate = audio_context.sampleRate;

	// create a gain node
	volume = audio_context.createGain();

	// create an audio node from the microphone incoming stream
	var audioInput = audio_context.createMediaStreamSource(e);
	console.log("Created media stream.");

	// connect stream to gain node
	audioInput.connect(volume);

	/* From the spec: This value controls how frequently the audioprocess event is 
	 * dispatched and how many sample-frames need to be processed each call. 
	 * Lower values for buffer size will result in a lower (better) latency. 
	 * Higher values will be necessary to avoid audio breakup and glitches */
	var bufferSize = 2048;

	// record only 1 channel
	var recorder = audio_context.createJavaScriptNode(bufferSize, 2, 2);

	// specify the processing function
	recorder.onaudioprocess = function(e) {
		console.log("recording");
		var left = e.inputBuffer.getChannelData(0);
		var right = e.inputBuffer.getChannelData(1);

		// clone the samples
		leftchannel.push(new Float32Array (left));
		rightchannel.push(new Float32Array (right));

		recordingLength += bufferSize;
	};

	// connect stream to our recorder
	volume.connect(recorder);

	// connect recorder to the previous destination
	recorder.connect(audio_context.destination);
}


/* Flat down each channel 
 */
function mergeBuffers(channelBuffer, recordingLength) {
	var result = new Float32Array(recordingLength);
	var offset = 0;
	var lng = channelBuffer.length;

	for (var i = 0; i < lng; i++) {
		var buffer = channelBuffer[i];
		result.set(buffer, offset);
		offset += buffer.length;
	}
	return result;
}


/* Interleave both channels together
 */
function interleave(left, right) {
	var length = left.length + right.length;
	var result = new Float32Array(length);

	var inputIndex = 0;

	for(var index = 0; index < length; ){
		result[index++] = left[inputIndex];
		result[index++] = right[inputIndex];
		inputIndex++;
	}

	return result;
}


/* Write to UTF Bytes
 */
function writeUTFBytes(view, offset, string) {
	var lng = string.length;

	for(var i = 0; i< lng; i++) {
		view.setUint8(offset + i, string.charCodeAt(i));
	}
}


/* Record audio
 */
document.getElementById("recordBtn").onclick = function record() {
	if(!recording) {
        alert('Recording');
		// reset buffer
		leftchannel.length = rightchannel.length = 0;
		recordingLength = 0;
        document.getElementById("output").innerHTML = "Recording now...";
		recording = true;
	} else {
        alert('Stop Recording');
		recording = false;

        document.getElementById("output").innerHTML = "Building Wave File...";

		// flatten channels
		var leftBuffer = mergeBuffers(leftchannel, recordingLength);
		var rightBuffer = mergeBuffers(rightchannel, recordingLength);

		// interleave
		var interleaved = interleave(leftBuffer, rightBuffer);

		// create wave file
		var buffer = new ArrayBuffer(44 + interleaved.length * 2);
		var view = new DataView(buffer);

	        // RIFF chunk descriptor
        writeUTFBytes(view, 0, 'RIFF');
        view.setUint32(4, 44 + interleaved.length * 2, true);
        writeUTFBytes(view, 8, 'WAVE');
        // FMT sub-chunk
        writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        // stereo (2 channels)
        view.setUint16(22, 2, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 4, true);
        view.setUint16(32, 4, true);
        view.setUint16(34, 16, true);
        // data sub-chunk
        writeUTFBytes(view, 36, 'data');
        view.setUint32(40, interleaved.length * 2, true);
        
        // write the PCM samples
        var lng = interleaved.length;
        var index = 44;
        var volume = 1;
        for (var i = 0; i < lng; i++){
            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
            index += 2;
        }
        
        // our final binary blob
        var blob = new Blob ( [ view ], { type : 'audio/wav' } );
        
        // let's save it locally
        // TODO EDIT to upload to server
        document.getElementById("output").innerHTML = "Handing off the file...";
        var url = (window.URL || window.webkitURL).createObjectURL(blob);
        var link = window.document.createElement('a');
        link.href = url;
        link.download = 'output.wav';
        var click = document.createEvent("Event");
        click.initEvent("click", true, true);
        link.dispatchEvent(click);	




	}

}
