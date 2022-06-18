import { join } from "path";
import fs from "fs";
import winston from "winston";

export default class Logger {
    _instance;
    _format;
    _conf;

    constructor(container) {
        this._conf = container.config.logger;
    }

    init(projectName = 'wavescore') {
        this._createLogger(projectName);
    }

    // Stream
    error(...data) {
        this._instance.get('stream').error(...data);
    }

    warn(...data) {
        this._instance.get('stream').warn(...data);
    }

    info(...data) {
        this._instance.get('stream').info(...data);
    }

    debug(...data) {
        this._instance.get('stream').debug(...data);
    }

    // Web api
    http(...data) {
        this._instance.get('webapi').http(...data);
    }

    _getFormat(projectName) {
        return winston.format.combine(
            winston.format.splat(),
            winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss,SSS'}),
            winston.format.label({ label: projectName}),
            winston.format.printf(({ level, message, label, timestamp }) => {
                return `${timestamp} [${label}] ${level}: ${message}`;
            }),
        );
    }

    _createLogger(projectName) {
        this._instance = new winston.Container();

        this._instance.add('webapi', {
            level: 'http',
            transports: [
                new winston.transports.File({
                    filename: join(this._conf.directory, `${projectName}-webapi.log`),
                    level: 'http'
                }),
            ]
        });

        this._instance.add('stream', {
            level: this._conf.level,
            format: this._getFormat(projectName),
            transports: [
                new winston.transports.File({
                    filename: join(this._conf.directory, `${projectName}-stream.log`),
                }),
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        this._getFormat(projectName)
                    ),
                }),
            ]
        });
    }
}