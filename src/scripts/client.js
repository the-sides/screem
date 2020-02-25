const quietImg = document.querySelector('img.off');
const loudImg = document.querySelector('img.on');
const screem = document.querySelector('audio')

let state = false; // Silent, off, don't screem
const startScreemer = () => {
    screem.autoplay = true;
    screem.play = true;
    screem.currentTime = 0.2;
    screem.volume = 1;
}

const stopScreemer = () => {
    screem.autoplay = false;
    screem.play = false;
    screem.currentTime = 0;
    screem.volume = 0;
}

const swapper = () => {
    if(state === false) {
        startScreemer()
        quietImg.classList.add('hidden')
        loudImg.classList.remove('hidden')
    }
    else {
        stopScreemer()
        quietImg.classList.remove('hidden')
        loudImg.classList.add('hidden')
    }
    state = !state;
}

window.swapper = swapper;

const webaudio_tooling_obj = function () {

    var audioContext = new AudioContext();

    console.log("audio is starting up ...");

    var BUFF_SIZE = 16384;

    var audioInput = null,
        microphone_stream = null,
        gain_node = null,
        script_processor_node = null,
        script_processor_fft_node = null,
        analyserNode = null;

    if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia){

        navigator.getUserMedia({audio:true}, 
          function(stream) {
              start_microphone(stream);
          },
          function(e) {
            alert('Error capturing audio.');
          }
        );

    } else { alert('getUserMedia not supported in this browser.'); }

    // ---

    function show_some_data(given_typed_array, num_row_to_display, label) {

        var size_buffer = given_typed_array.length;
        var index = 0;
        var max_index = num_row_to_display;

        console.log("__________ " + label);

        let avg = 0;
        let sum = 0;
        for (; index < max_index && index < size_buffer; index += 1) {
            sum += given_typed_array[index]
        }
        avg = sum / 5;
        console.log(avg);

        if(!state & avg > 70){
            swapper();
        }
        if(state & avg < 30){
            swapper();
        }
    }

    function process_microphone_buffer(event) { // invoked by event loop

        var i, N, inp, microphone_output_buffer;

        // microphone_output_buffer = event.inputBuffer.getChannelData(0); // just mono - 1 channel for now

        // microphone_output_buffer  <-- this buffer contains current gulp of data size BUFF_SIZE

        show_some_data(microphone_output_buffer, 5, "from getChannelData");
    }

    function start_microphone(stream){

      gain_node = audioContext.createGain();
    //   gain_node.connect( audioContext.destination );   // Mic audio to speakers

      microphone_stream = audioContext.createMediaStreamSource(stream);
      microphone_stream.connect(gain_node); 

      script_processor_node = audioContext.createScriptProcessor(BUFF_SIZE, 1, 1);
    //   script_processor_node.onaudioprocess = process_microphone_buffer;

      microphone_stream.connect(script_processor_node);

      // --- setup FFT

      script_processor_fft_node = audioContext.createScriptProcessor(2048, 1, 1);
      script_processor_fft_node.connect(gain_node);

      analyserNode = audioContext.createAnalyser();
      analyserNode.smoothingTimeConstant = 0;
      analyserNode.fftSize = 2048;

      microphone_stream.connect(analyserNode);

      analyserNode.connect(script_processor_fft_node);

      script_processor_fft_node.onaudioprocess = function() {

        // get the average for the first channel
        var array = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(array);

        // draw the spectrogram
        if (microphone_stream.playbackState == microphone_stream.PLAYING_STATE) {

            show_some_data(array, 5, "from fft");
        }
      };
    }

  }(); //  webaudio_tooling_obj = function()

