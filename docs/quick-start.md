# Quick start

It is recommended to install `wavescore` globally, if the application logic should not change
```bash
npm i wavescore -g
```

## Create a project
To create project in the current directory with name `mystream`, run command `create`. This will create the basic structure of the project
```bash
wavescore create ./mystream
```

## Set stream key in config file
In the base folder of the project you will find `config.json` file. The project is configured in this file.

Put in your stream_url and stream_key and also check out the other settings. If you want to stream on YouTube, we even already setup the stream url for you (you might noticed the $stream_key in the url, this is a variable and will be replaced with the stream key!).
```json 
{
  "stream_url": "rtmp://a.rtmp.youtube.com/live2/$stream_key",
  "stream_key": "<here you need to set your key>",
  "render": {
    "ffmpeg_path": "",
    "video_codec": "libx264",
    "audio_codec": "aac",
    ...
```