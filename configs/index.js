export default async () => {
    return {
        stream: {
            projectsFolder: `${process.cwd()}/projects/`,
            supportedExtensions: {
                audio: [/\.mp3$/, /\.flac$/, /\.wav$/],
                video: [/\.mov$/, /\.avi$/, /\.mkv$/, /\.webm$/, /\.mp4$/, /\.gif$/]
            }
        },
        logger: {
            directory: `${process.cwd()}/logs`,
            level: 'info',
        }
    };
}