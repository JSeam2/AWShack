import io

def transcribe_file(speech_file):
    """
    Transcribe the given audio file.
    """
    from google.cloud import speech
    from google.cloud.speech import enums
    from google.cloud.speech import types
    client = speech.SpeechClient()

    # [START migration_sync_request]
    # [START migration_audio_config_file]
    with io.open(speech_file, 'rb') as audio_file:
        content = audio_file.read()

    audio = types.RecognitionAudio(content=content)
    config = types.RecognitionConfig(
        encoding=enums.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code='en-US')
    # [END migration_audio_config_file]

    # [START migration_sync_response]
    response = client.recognize(config, audio)
    # [END migration_sync_request]
    # Each result is for a consecutive portion of the audio. Iterate through
    # them to get the transcripts for the entire audio file.
    for result in response.results:
        # The first alternative is the most likely one for this portion.
        print(u'Transcript: {}'.format(result.alternatives[0].transcript))
    # [END migration_sync_response]
# [END def_transcribe_file]

API_KEY = "AIzaSyBIICh6AEzY6rgCqqVJYI8yW9k33BBcM78"

API_ENDPOINT = "https://speech.googleapis.com/v1/speech"

if __name__ == "__main__":
    transcribe_file('/home/ada/Hackathon/awshackaudio/record2.mp3')
