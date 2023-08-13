class LoggerCls {
    constructor(name, man) {
        this.name = name;
        this.man = man;
    }

    info = (...args) => {
        if (this.name) {
            console.log(`[${this.name}]`, ...args);
        } else {
            console.log(...args);
        }
    }

    error = (...args) => {
        if (this.name) {
            console.error(`[${this.name}]`, ...args);
        } else {
            console.error(...args);
        }
    }

    debug = (...args) => {
        if (!this.man.isDebug) return;
        if (this.name) {
            console.log(`[${this.name}]`, ...args);
        } else {
            console.log(...args);
        }
    }
}

export const logManager = new class {
    loggers = [];
    isDebug = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    getLogger = (name) => {
        let logger = new LoggerCls(name, this);
        this.loggers.push(logger);
        return logger;
    }
}();

export const loggerForComponent = (component) => {
    const name = component.displayName || component.name;
    return logManager.getLogger(name);
}

export const log = logManager.getLogger("");
