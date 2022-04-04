class LoggerService {
  constructor(
    message = 'UNKNOWN ERROR',
    type = 'log',
    errorExtraInformation = null,
    responseData = null
  ) {
    this.validTypes = ['log', 'warn', 'info', 'error', 'debug'];
    this.message = message;
    this.type = this.validTypes.indexOf(type) !== -1 ? type : 'log';
    this.errorExtraInformation = errorExtraInformation;
    this.responseData = responseData;
  }

  log() {
    if (
      this.errorExtraInformation &&
      this.errorExtraInformation instanceof Error
    ) {
      this.message = `${this.message}: => ${this.errorExtraInformation.message}`;
    }

    console[this.type](JSON.stringify(this.createLogEntry()));
  }

  static createLogObject(response) {
    return new LoggerService(
      response.message,
      response.error ? 'error' : 'log',
      response.error && new Error(response.message),
      response.data
    );
  }

  createLogEntry() {
    const logInfo = {
      message: this.message.toUpperCase(),
      severity: this.type.toUpperCase(),
    };
    if (this.errorExtraInformation) {
      logInfo.error =
        this.errorExtraInformation.stack ||
        JSON.stringify(this.errorExtraInformation);
    } else {
      logInfo.payload = this.responseData;
    }
    return logInfo;
  }
}

module.exports = LoggerService;
