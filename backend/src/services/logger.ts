import pino from "pino";

const logger = pino({
  level: 'info', // Default log level
  transport: {
    target: 'pino-pretty', // Pretty logs in dev
    options: {
      colorize: true, // Add colors to the logs
    },
  },
});

export default logger